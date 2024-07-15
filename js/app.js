const API_URL = 'http://localhost:3000';

class OnlineTestApp {
    constructor() {
        this.quizContainer = document.getElementById('quiz-container');
        this.resultContainer = document.getElementById('result-container');
        this.questions = [];
        this.userAnswers = [];
    }

    async init() {
        try {
            const response = await fetch(`${API_URL}/questions`);
            this.questions = await response.json();
            this.renderQuiz();
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            this.quizContainer.innerHTML = '<p>Failed to load questions. Please try again later.</p>';
        }
    }

    renderQuiz() {
        this.quizContainer.innerHTML = this.questions.map(q => `
            <div class="mb-4">
                <h5>${q.text}</h5>
                ${q.options.map(option => `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="question${q.id}" value="${option}" id="q${q.id}o${option}">
                        <label class="form-check-label" for="q${q.id}o${option}">${option}</label>
                    </div>
                `).join('')}
            </div>
        `).join('');

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.className = 'btn btn-primary';
        submitButton.addEventListener('click', () => this.submitQuiz());
        this.quizContainer.appendChild(submitButton);
    }

    async submitQuiz() {
        this.userAnswers = this.questions.map(q => ({
            id: q.id,
            answer: document.querySelector(`input[name="question${q.id}"]:checked`)?.value || null
        }));

        try {
            const response = await fetch(`${API_URL}/answers`);
            const answers = await response.json();
            this.displayResult(answers);
        } catch (error) {
            console.error('Failed to fetch answers:', error);
            this.resultContainer.innerHTML = '<p>Failed to submit quiz. Please try again later.</p>';
        }
    }

    displayResult(answers) {
        const results = this.userAnswers.map(ua => ({
            id: ua.id,
            correct: ua.answer === answers.find(a => a.id === ua.id).correctAnswer
        }));
        
        this.resultContainer.innerHTML = `
            <h3>Results</h3>
            ${results.map(r => `
                <div class="mb-3">
                    <p>Question ${r.id}: ${r.correct ? 'Correct' : 'Incorrect'}</p>
                    <p>Your answer: ${this.userAnswers.find(ua => ua.id === r.id).answer || 'Not answered'}</p>
                    <p>Correct answer: ${answers.find(a => a.id === r.id).correctAnswer}</p>
                </div>
            `).join('')}
            <p>Score: ${results.filter(r => r.correct).length} / ${results.length}</p>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new OnlineTestApp();
    app.init();
});
