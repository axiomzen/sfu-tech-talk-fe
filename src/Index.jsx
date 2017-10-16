import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';

import Form from './Form.jsx';
import QuestionList from './QuestionList.jsx';

const postUrl = 'https://sfu-tech-talk.herokuapp.com/questions';
const apiToken = 'sfu';

function readLocalStorage() {
  const currentVotedQuestions = localStorage.votedQuestions || '[]';
  return JSON.parse(currentVotedQuestions);
}

function updateLocalStorage(questionId) {
  const votedQuestions = readLocalStorage();
  votedQuestions.push(questionId);
  localStorage.votedQuestions = JSON.stringify(votedQuestions);
}

function postQuestion(data) {
  return fetch(postUrl, {
    method: 'post',
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      'Authorization': apiToken
    },
    body: JSON.stringify(data)
  }).catch(function(err) {
    window.alert("There's no endpoint set up to submit a new question!");
  });
}

function fetchQuestions() {
  return fetch(postUrl, {
    headers: {
      'Authorization': apiToken
    }
  }).then(function(res) {
    return res.json();
  }).catch(function(err) {
    window.alert("There's no endpoint set up to retrieve all questions! Check the browser's developer tools > network tab for more information!");
  });
}

function upvote(questionId) {
  return fetch(`${postUrl}/${questionId}/vote`, {
    method: 'post',
    headers: {
      'Authorization': apiToken
    }
  }).catch(function(err) {
    window.alert("There's no endpoint set up to upvote a question!");
  });
}

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: []
    };
    this.onUpvote = this.onUpvote.bind(this);
  }

  componentDidMount() {
    const me = this;
    fetchQuestions().then(function(questions) {
      questions = questions || [];
      const currentVotedQuestions = readLocalStorage();
      questions.map(function(question) {
        if (currentVotedQuestions.includes(question.id)) {
          questions.voted = true;
        }
      })
      me.setState({ questions });
    })
  }

  onUpvote(questionId) {
    const me = this;
    upvote(questionId).then(function() {
      const questions = me.state.questions;
      const questionIndex = questions.findIndex(function(question) {
        return question.id === questionId;
      });
      questions[questionIndex].voted = true;
      questions[questionIndex].upvotes++;
      me.setState(
        {questions},
        updateLocalStorage(questionId)
      );
    });
  }

  render() {
    return (
      <div>
      <h2>Submit a question</h2>
      <Form onSubmit={postQuestion} />
      <h2>Questions</h2>
      <QuestionList questions={this.state.questions} onUpvote={this.onUpvote} />
      </div>
    );
  }

}

ReactDOM.render(<Index />, document.getElementById('root'));
