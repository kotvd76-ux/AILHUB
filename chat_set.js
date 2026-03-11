/**
 * chat_set.js — Налаштування модуля "Чат / Урок / Тест"
 * ────────────────────────────────────────────────────────
 * Залежність: підключати після sett_set.js:
 *   <script src="sett_set.js"></script>
 *   <script src="chat_set.js"></script>
 */

/* ── Конфігурація ──────────────────────────────────────── */
const CHAT_CONFIG = {

  // Маркери для вбудованих JSON-корекцій у відповідях AI (режим chat)
  correctionMarkers: {
    open:  '%%CORRECTION_START%%',
    close: '%%CORRECTION_END%%',
  },

  // Параметри тестування
  test: {
    maxTokensGenerate: 2500,  // генерація питань
    maxTokensEvaluate: 600,   // оцінка відкритої відповіді
    maxTokensReport:   1200,  // фінальний звіт
    feedbackDelay:     2000,  // мс між показом зворотного зв'язку та наступним питанням
  },

  // Параметри сесії (урок / чат)
  session: {
    maxTokensInit:  800,  // перша репліка AI
    maxTokensReply: 600,  // наступні репліки
  },

  // Кількість питань на аспект у тесті
  aspects: [
    { id: 'grammar',    questions: 5 },
    { id: 'vocabulary', questions: 5 },
    { id: 'listening',  questions: 4 },
    { id: 'reading',    questions: 4 },
    { id: 'writing',    questions: 3 },
    { id: 'speaking',   questions: 3 },
    { id: 'pragmatics', questions: 3 },
  ],

  // Параметри Native Audio Dialog (NAD)
  nad: {
    showToggle:     true,     // показувати тогл NAD у налаштуваннях сесії
    recordingMode:  'button', // 'button' | 'auto'
    sessionMaxMin:  10,       // обмеження тривалості NAD-сесії (хвилини)
    openai: {
      model: 'gpt-4o-realtime-preview-2024-12-17',
    },
  },
};

/* ── Допоміжна: повертає мову UI та роль вчителя ────────── */
const _chatLang = () => (typeof getLangConfig === 'function')
  ? getLangConfig()
  : { uiLanguage: 'Ukrainian (UA)', teacherRole: 'professional Spanish teacher', speechLang: 'es-ES' };

/* ── Промпти ────────────────────────────────────────────── */
const CHAT_PROMPTS = {

  /* ── Генерація тестових питань ──────────────────────── */
  testGenerate: {
    system: `You are a ${_chatLang().teacherRole} creating a Spanish language proficiency test.
Generate questions strictly as a JSON array. Do not include any text outside the JSON.
Each item must have:
  - "aspect": one of grammar|vocabulary|listening|reading|writing|speaking|pragmatics
  - "question": the question text in ${_chatLang().uiLanguage}
  - "correct": the correct answer (string)
  - "options": array of 4 strings for multiple-choice, OR omit for open-ended
  - "passage": (optional) reading/listening text the question refers to
  - "audio_text": (optional) Spanish phrase to read aloud for listening questions
Calibrate difficulty to the requested CEFR level(s). Use ${_chatLang().uiLanguage} for all instructions.`,

    user: (aspects, lvl) =>
      `Generate a Spanish proficiency test for CEFR level(s): ${lvl}.
Include questions for these aspects: ${aspects.join(', ')}.
Per aspect use exactly these counts: grammar=5, vocabulary=5, listening=4, reading=4, writing=3, speaking=3, pragmatics=3 — but only for the requested aspects.
For "listening" aspects always include "audio_text" (a short Spanish phrase/sentence).
For "reading" aspects always include "passage" (2-4 Spanish sentences).
For "speaking" and "writing" aspects use open-ended questions (no "options").
Return ONLY a valid JSON array.`,
  },

  /* ── Оцінка відкритої відповіді ─────────────────────── */
  testEvaluate: {
    system: `You are a ${_chatLang().teacherRole} evaluating a student's Spanish answer.
Return ONLY a JSON object with:
  - "score": integer 0-10
  - "correct": boolean
  - "feedback": short explanation in ${_chatLang().uiLanguage} (1-3 sentences)
  - "error_analysis": brief grammar/vocabulary notes in ${_chatLang().uiLanguage}, or ""
Do not include text outside the JSON.`,

    user: (question, answer, correct, aspect) =>
      `Question (${aspect}): ${question}
Student's answer: ${answer}
Expected/model answer: ${correct}
Evaluate the student's answer. Be encouraging but accurate. Return ONLY JSON.`,
  },

  /* ── Фінальний звіт тесту ───────────────────────────── */
  testReport: {
    system: `You are a ${_chatLang().teacherRole} writing a student assessment report.
Return ONLY a JSON object with:
  - "cefr": recommended CEFR level string (A1|A2|B1|B2|C1)
  - "overall_score": integer 0-100
  - "weak_aspects": array of aspect IDs with low scores
  - "strong_aspects": array of aspect IDs with high scores
  - "recommendations": array of 3-5 actionable advice strings in ${_chatLang().uiLanguage}
Do not include text outside the JSON.`,

    user: (scores, allAnswers) => {
      const scoreLines = Object.entries(scores)
        .map(([id, s]) => `  ${id}: ${s}/10`)
        .join('\n');
      const total = allAnswers.length;
      const correct = allAnswers.filter(a => a.result && a.result.correct).length;
      return `Test results:
Aspect scores (0-10):
${scoreLines}
Total questions: ${total}, correct: ${correct}
Analyze weaknesses and strengths. Recommend a CEFR level. Return ONLY JSON.`;
    },
  },

  /* ── Живий голосовий чат (NAD) ──────────────────────── */
  chatNAD: {
    system: (level, topic) => {
      const { teacherRole, uiLanguage } = _chatLang();
      const topicLine = topic ? `The conversation topic is: "${topic}".` : 'Choose an interesting everyday topic to discuss.';
      return `You are a friendly and patient ${teacherRole} having a spoken conversation with a student in Spanish.
Student's CEFR level: ${level}. ${topicLine}
Speak naturally at a pace appropriate for ${level}. Use vocabulary and grammar matching ${level}.
After the student speaks, respond in Spanish, then briefly correct any significant errors by restating the correct form naturally within your reply.
Keep responses concise (2-4 sentences). Encourage the student warmly.
If the student writes in ${uiLanguage}, gently remind them to speak Spanish and provide the phrase they might want to say.`;
    },
  },

  /* ── Урок (AI веде урок) ────────────────────────────── */
  lesson: {
    system: (level, progressText) => {
      const { teacherRole, uiLanguage } = _chatLang();
      const progressSection = progressText
        ? `\nStudent's progress file:\n---\n${progressText.slice(0, 1500)}\n---\nUse this to personalize the lesson.`
        : '';
      return `You are a ${teacherRole} leading an interactive Spanish lesson.
Student's CEFR level: ${level}. Conduct the lesson primarily in Spanish, with explanations in ${uiLanguage} when needed.
Structure: briefly introduce a grammar point or vocabulary topic, give examples, then ask the student practice questions.
Adapt complexity to ${level}. Be encouraging. Keep each message focused and not too long (3-6 sentences).${progressSection}`;
    },
  },

  /* ── Вільний чат з корекцією помилок ────────────────── */
  chat: {
    system: (level, topic) => {
      const { teacherRole, uiLanguage } = _chatLang();
      const { open, close } = CHAT_CONFIG.correctionMarkers;
      const topicLine = topic ? `The topic is: "${topic}".` : 'Choose a natural conversational topic.';
      return `You are a friendly ${teacherRole} chatting with a student in Spanish.
Student's CEFR level: ${level}. ${topicLine}
Rules:
1. Reply naturally in Spanish, matching the student's level.
2. Keep replies concise (2-4 sentences).
3. If the student makes grammar or vocabulary errors, include a correction block AFTER your reply using this exact format:
${open}
{"original":"<student's wrong phrase>","corrected":"<correct Spanish>","explanation":"<short explanation in ${uiLanguage}>"}
${close}
4. Only correct significant errors, not minor ones.
5. If the student writes in ${uiLanguage}, respond in ${uiLanguage} briefly, then ask them to continue in Spanish.`;
    },
  },
};
