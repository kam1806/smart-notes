import React, { useState, useMemo } from 'react';
import './QuizSection.css'; // <--- IMPORT THE NEW CSS

const QuizSection = ({ quizzes }) => {
  const mcqs = quizzes.filter(q => !q.is_flashcard);
  const flashcards = quizzes.filter(q => q.is_flashcard);

  return (
    <div className="quiz-section-wrapper">
      
      {/* FLASHCARDS SECTION */}
      {flashcards.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            ⚡ Flashcards 
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Click cards to flip
            </span>
          </h3>
          <div className="quiz-grid">
            {flashcards.map((card, idx) => (
              <FlashcardItem key={idx} card={card} />
            ))}
          </div>
        </section>
      )}

      {/* MCQ SECTION */}
      {mcqs.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h3>
          <div className="space-y-6">
            {mcqs.map((q, idx) => (
              <MCQItem key={idx} question={q} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// --- FLASHCARD COMPONENT ---
const FlashcardItem = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner">
        {/* FRONT */}
        <div className="flashcard-front">
          <span className="text-3xl mb-4">❓</span>
          <h4>{card.question_text}</h4>
          <span className="tap-hint">Tap to Reveal Answer</span>
        </div>

        {/* BACK */}
        <div className="flashcard-back">
          <span className="text-3xl mb-4">💡</span>
          <p className="font-bold text-lg">{card.correct_answer}</p>
        </div>
      </div>
    </div>
  );
};

// --- MCQ COMPONENT ---
const MCQItem = ({ question, index }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Randomize options
  const options = useMemo(() => {
    const allOptions = [
      question.correct_answer, 
      question.distractor_1, 
      question.distractor_2, 
      question.distractor_3
    ].filter(Boolean);
    return allOptions.sort(() => Math.random() - 0.5);
  }, [question]);

  const handleSelect = (option) => {
    if (selectedOption) return; // Lock after selection
    setSelectedOption(option);
    setIsCorrect(option === question.correct_answer);
  };

  return (
    <div className="mcq-card">
      <p className="mcq-question">
        {index + 1}. {question.question_text}
      </p>
      
      <div className="mcq-options">
        {options.map((opt, i) => {
          // Determine class based on state
          let btnClass = "mcq-option-btn";
          if (selectedOption) {
            if (opt === question.correct_answer) btnClass += " correct"; // Always show green for right answer
            else if (selectedOption === opt && !isCorrect) btnClass += " wrong"; // Show red if you picked wrong
            else btnClass += " dimmed"; // Fade out others
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={selectedOption !== null}
              className={btnClass}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* FEEDBACK MESSAGE */}
      {selectedOption && (
        <div className={`feedback-msg ${isCorrect ? 'success' : 'error'}`}>
          {isCorrect ? "🎉 Correct! Well done." : `❌ Incorrect. The answer is ${question.correct_answer}`}
        </div>
      )}
    </div>
  );
};

export default QuizSection;