import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { Footer } from "../components/layouts/Footer";
import { Button, Progress, Tabs, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { RiseOutlined } from "@ant-design/icons";
import axios from "axios";
import { BottomNavigation } from "../components/layouts/BottomNav";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 480px;
  align-items: center;
  height: 100dvh;
  gap : 40px;
  padding : 24px;
`

interface LocationState {
  userAnswers: string[];
  questions: any[]; // 여기에 questions의 타입을 명시해주어야 합니다.
}

export const TestResult = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const { userAnswers, questions } = location.state as LocationState;
  const [score, setScore] = useState<number>()
  const [recentScore, setRecentScore] = useState<number>()
  const [prevScore, setPrevScore] = useState<number>()

  const onChange = (key: string) => {
    if (key === '2') { // key가 '2'일 때, 즉 '문제 풀기' 탭이 선택되었을 때
      navigate('/home');
    }
  };

  const userCorrectAnswers = questions.map((question, index) => userAnswers[index] === question.answer);

  const userScore = (userCorrectAnswers.filter(answer => answer).length / questions.length) * 100;

  useEffect(() => {
    console.log(userAnswers)
    console.log(questions)
    const levelWeights = [0, 20, 25, 30, 35, 40];
    const userCorrectAnswers = questions.map((question, index) => userAnswers[index] === question.answer);

    // 사용자의 점수 계산
    const userScore = userCorrectAnswers.reduce((score, isCorrect, index) => {
      const question = questions[index];
      const levelWeight = levelWeights[question.level];
      return isCorrect ? score + levelWeight : score;
    }, 0);

    const maxScore = questions.reduce((total, question) => total + levelWeights[question.level], 0);
    const userPercentageScore = Math.round((userScore / maxScore) * 100);
    setScore(userPercentageScore)
    console.log(userPercentageScore)



    // 서버에 데이터를 전송
    const apiUrl = "http://localhost:8000/user/add_test/";
    axios.post(apiUrl, {
      email: "haesummy@gmail.com",
      score: userPercentageScore
    })
      .then(async (response: any) => {
        console.log("Response from server:", response.data);
        const user = await axios.post("http://localhost:8000/users/", {
          email: "haesummy@gmail.com",
        })
        console.log(user)
        setPrevScore(user.data.prevScore)
        setRecentScore(user.data.recentScore)
      })
  }, [])

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '나의 분석',
      children: (
        <div>
          <h3>당신의 문해력 레벨은</h3>
          <Progress type="circle" percent={score} format={() => `${score}점`} />
          <h4>내 나이대 평균 점수는 72.4점</h4>
          <Button onClick={() => { navigate('/testInit') }}>문해력 문제 풀러가기</Button>
          <h4>지난주보다 {recentScore!! - prevScore!!}점 올랐어요. <RiseOutlined /></h4>
          <Progress steps={3} percent={prevScore} size={20} format={() => `${prevScore}점`} />
          <br />
          <Progress steps={3} percent={recentScore} format={() => `${recentScore}점`} size={20} />


        </div>
      ),
    },
    {
      key: '2',
      label: '홈',
      children: (
        <Button onClick={() => navigate('/home')}>홈</Button>
      ),
    }
  ]

  return (
    <div>
      <Container>
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} centered style={{ width: "100%", display: "flex", justifyContent: "center", height: "100dvh", gap: "32px" }} />

      </Container>
      {/* <BottomNavigation></BottomNavigation> */}

    </div>
  );
}
