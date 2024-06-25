import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const questionsData = [
  'What is the capital of France?',
  'What is the largest ocean?',
  'Which planet is nearest to the sun?',
  'What is the brightest star in the night sky?',
  'What is the most common metal in the earth\'s crust?',
];

const optionsData = [
  ['Paris', 'Berlin', 'Madrid', 'Rome'],
  ['Atlantic', 'Pacific', 'Indian', 'Southern'],
  ['Mercury', 'Venus', 'Earth', 'Mars'],
  ['Sirius', 'Canopus', 'Rigel', 'Betelgeuse'],
  ['Iron', 'Sulphur', 'Copper', 'Silver'],
];

const Question = ({ question, options, step, handleOptionChange, selectedOption }) => (
  <div className="question">
    <p className="question-text">{question}</p>
    {options.map((option, index) => (
      <div key={index} className="label-wrapper">
        <input
          type="radio"
          name={`question-${step}`}
          id={`option-${step}-${index}`}
          value={index}
          checked={selectedOption === index}
          onChange={() => handleOptionChange(step, index)}
        />
        <label htmlFor={`option-${step}-${index}`}>{option}</label>
      </div>
    ))}
  </div>
);


const Result = ({ score, message, onPlayAgain }) => (
  <div>
    <p>Thanks for playing! Your Score: {score}</p>
    {message && <p>{message}</p>}
    <button onClick={onPlayAgain}>Play Again</button>
  </div>
);

const App = () => {
  const [questions] = useState(questionsData);
  const [options] = useState(optionsData);
  const [answers, setAnswers] = useState([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [name, setName] = useState('');

  console.log('API URL:', process.env.REACT_APP_API_URL);

  const handleOptionChange = (step, index) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[step] = index;
      return newAnswers;
    });
  };

  const handleNext = (event) => {
    event.preventDefault();
    if (currentStep < questions.length && answers[currentStep] !== undefined) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submitting answers:', answers);
    axios.post(`${process.env.REACT_APP_API_URL}/validate-answers`, { answers })
      .then((res) => {
        console.log('Validation response:', res.data);
        setCorrectAnswersCount(res.data.correctAnswersCount);
        setQuizResult('If you\'re not satisfied with your answer, click Play Again to restart the game.');
        setShowResult(true);
        saveResult(res.data.correctAnswersCount);
      })
      .catch((err) => {
        console.error('Error submitting answers:', err);
      });
  };

  const saveResult = (score) => {
    console.log('Saving result:', { name, score });
    axios.post(`${process.env.REACT_APP_API_URL}/save-result`, { name, score })
      .then((res) => {
        console.log('Save result response:', res.data);
      })
      .catch((err) => {
        console.error('Error saving result:', err);
      });
  };

  const handlePlayAgain = () => {
    setQuizStarted(false);
    setCurrentStep(0);
    setAnswers([]);
    setCorrectAnswersCount(0);
    setQuizResult(null);
    setShowResult(false);
    setName('');
  };

  const renderQuestions = () => {
    if (!quizStarted) {
      return (
        <div>
          <p>Welcome to the quiz game! Do you want to play?</p>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={() => setQuizStarted(true)}>Play</button>
        </div>
      );
    }

    if (showResult) {
      return <Result score={correctAnswersCount} message={quizResult} onPlayAgain={handlePlayAgain} />;
    }

    return (
      <div>
        <Question
          question={questions[currentStep]}
          options={options[currentStep]}
          step={currentStep}
          handleOptionChange={handleOptionChange}
          selectedOption={answers[currentStep]}
        />
        <div>
          <button
            onClick={currentStep === questions.length - 1 ? handleSubmit : handleNext}
            disabled={answers[currentStep] === undefined}
          >
            {currentStep === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <h1><u>Brain Time</u></h1>
      <form>
        {renderQuestions()}
      </form>
      <div className="Copyright">Copyright &copy; 2024 Ishan Lamsal</div>
    </div>
  );
};

export default App;
