const AI_EXERCISE_CONFIG = {
    // Спільні системні налаштування для вчителя
    // Мова береться динамічно з getLangConfig() (sett_set.js)
    get baseSystemPrompt() {
        const lang = (typeof getLangConfig === 'function') ? getLangConfig() : { teacherRole: 'professional Spanish teacher' };
        return `Ти — ${lang.teacherRole}-тренажер. Твоє мовлення має бути чітким, лаконічним і відповідати рівню користувача. `;
    },

    // ─── ПРОФІЛІ РІВНІВ ──────────────────────────────────────────────────────────
    // Використовується в системних промптах для адаптації мови та темпу
    levelProfiles: {
        A1: { pace: 'дуже повільно з паузами', lexicon: 'тільки ser/estar/tener/ir/querer, числа, кольори', syntax: '1 речення 4-6 слів', grammar: 'лише presente indicativo' },
        A2: { pace: 'повільно, чітко',         lexicon: 'базова побутова лексика, frecuentes дієслова',    syntax: '1-2 короткі речення', grammar: 'presente + indefinido' },
        B1: { pace: 'помірний темп',           lexicon: 'розмовна лексика середнього рівня',               syntax: '2-3 речення',          grammar: 'всі основні часи, subjuntivo просто' },
        B2: { pace: 'близько до природного',   lexicon: 'вільна розмовна лексика, ідіоми',                 syntax: '3-4 речення',          grammar: 'складні форми, subjuntivo вільно' },
        C1: { pace: 'природний темп носія',    lexicon: 'багата лексика, ідіоматичні вирази',              syntax: '4-5 речень',           grammar: 'весь граматичний спектр' },
    },

    // Повертає рядок профілю для вставки в промпт
    getLevelInstruction(level) {
        const p = this.levelProfiles[level] || this.levelProfiles['B1'];
        return `Рівень учня: ${level}. Профіль: темп — ${p.pace}; лексика — ${p.lexicon}; синтаксис — ${p.syntax}; граматика — ${p.grammar}. Суворо дотримуйся цього профілю.`;
    },

    // Специфічні інструкції для кожного типу вправи
    // system — функція від (level) => string; мова береться з getLangConfig()
    exercises: {
        'echo': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Shadowing Lite. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} ГЕНЕРУЙ ЛИШЕ ОДНЕ коротке речення мовою ${L.targetName} відповідно до профілю.${L.helperClause} НЕ пиши вступів. Користувач має його повторити.`; },
            example: "Hola, me llamo Juan y vivo en Madrid."
        },
        'simple_question': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Simple Question. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Постав ОДНЕ просте запитання мовою ${L.targetName} відповідно до профілю рівня.${L.helperClause}`; },
            example: "¿Cómo te llamas?"
        },
        'conversion': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Конвертація речення. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} СУВОРО за шаблоном: ГЕНЕРУЙ фразу мовою ${L.targetName} відповідно до рівня + ПРЯМА ВКАЗІВКА на зміну (час або особа).${L.helperClause} НЕ вітайся, НЕ пояснюй правила.`; },
            example: "Yo vivo en Madrid. Cambia a pasado."
        },
        'describe': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'English',helperClause:''}; return `Вправа: Опис зображення. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Учню показано картинку. ПРАВИЛА: 1) НЕ описуй картинку — лише попроси учня описати її мовою ${L.targetName} (2-3 речення відповідно до рівня). 2) Після відповіді учня — дай КОРОТКИЙ фідбек на помилки та запитай одну додаткову деталь. 3) НЕ пиши вступів і привітань.${L.helperClause}`; },
            sceneSystemPrompt: 'You are a creative scene generator for educational purposes. Return ONLY a scene description, no questions, no extra text.',
            scenePromptInstruction: (level) => `Generate a vivid scene description for an English learning illustration. Level: ${level}. Include 2-3 details (people, place, action, time of day or weather), 20-30 words, in English. Return ONLY the scene description. Example: "A young woman sitting on a park bench reading a book on a sunny afternoon, with pigeons nearby"`,
            imageModel: 'gemini-2.0-flash-preview-image-generation',
            example: "Look at the picture. Please describe what you see. Give 2-3 sentences."
        },
        'explain_word': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Поясни слово. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Загадай слово мовою ${L.targetName} відповідно до рівня складності і попроси пояснити його значення ${L.targetName}, не називаючи саме слово.${L.helperClause}`; },
            example: "Explica la palabra 'Coche' sin usar la palabra."
        },
        'what_happened': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Що сталося? ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Опиши дивну або цікаву ситуацію в минулому мовою ${L.targetName} відповідно до рівня. Користувач має пояснити причину.${L.helperClause}`; },
            example: "Llegaste a casa y la puerta estaba abierta. ¿Qué pasó?"
        },
        'expand_sentence': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Розширення речення. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Дай ДУЖЕ коротке речення мовою ${L.targetName} відповідне рівню. Після кожної відповіді проси додати ОДНУ деталь (хто, де, чому, думка).${L.helperClause}`; },
            example: "Ayer fui al cine."
        },
        'roleplay': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Рольова гра. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Ти — офіціант, продавець або адміністратор готелю. Веди діалог мовою ${L.targetName} відповідно до профілю рівня ${level}.${L.helperClause}`; },
            example: "¡Buenos días! ¿Qué desea tomar?"
        },
        'debate': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Дебати. ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Вислови тезу мовою ${L.targetName} на актуальну тему. Запитай думку користувача і готуйся контраргументувати кожну його репліку.${L.helperClause}`; },
            example: "Creo que el plástico debería prohibirse totalmente. ¿Qué opinas?"
        },
        'paraphrase': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Перефразування (B2). ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Дай одне речення мовою ${L.targetName}. Попроси учня переформулювати його повністю іншими словами, зберігаючи зміст. Після відповіді — оціни збереження змісту та різноманіття лексики.${L.helperClause}`; },
            example: "El tren llegó tarde porque había mucho tráfico. Dilo de otra manera."
        },
        'story_continue': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Продовж історію (B2). ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Почни коротку цікаву історію (2-3 речення) мовою ${L.targetName} і зупинись на напруженому місці. Учень має продовжити. Після кожної репліки учня — розвивай сюжет далі і знову зупиняйся.${L.helperClause}`; },
            example: "Era una noche de tormenta cuando escuché un ruido extraño en el sótano. Me acerqué despacio... ¿Qué pasó después?"
        },
        'translate_interpret': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',uiLanguage:'Ukrainian',helperClause:''}; return `Вправа: Перекладач-інтерпретатор (C1). ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Дай складну фразу мовою ${L.uiLanguage} з ідіомами, офіційним або емоційним стилем. Попроси перекласти її природною ${L.targetName} — не дослівно, а за змістом. Після відповіді оціни природність перекладу.${L.helperClause}`; },
            example: "Перекладай: «Він водить мене за носа вже третій місяць поспіль.»"
        },
        'argue_position': {
            system: (level) => { const L = (typeof getLangConfig==='function') ? getLangConfig() : {targetName:'Spanish',helperClause:''}; return `Вправа: Захист позиції (C1). ${AI_EXERCISE_CONFIG.getLevelInstruction(level)} Призначай учню певну позицію (навіть контроверсійну) і він має її захищати мовою ${L.targetName} мінімум 3-4 репліки підряд. Ти граєш опонента — контраргументуй, задавай уточнювальні питання, тисни на слабкі місця аргументів.${L.helperClause}`; },
            example: "Tu posición: 'Las redes sociales hacen más daño que bien.' Defiéndela."
        }
    },

    // Налаштування фідбеку
    feedback: {
        get system() {
            const lang = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian', helperClause: '' };
            return `Ти вчитель ${lang.targetName}. Твоя мета — дати ДУЖЕ КОРОТКИЙ фідбек (до 20 слів) мовою ${lang.uiLanguage}.${lang.helperClause} Якщо є помилка в ${lang.targetName} — виправ її. Якщо все правильно — похвали.`;
        },
        style: "friendly"
    }
};

// Експорт для використання в HTML (якщо скрипт підключено через <script src="...">)
if (typeof window !== 'undefined') {
    window.AI_EXERCISE_CONFIG = AI_EXERCISE_CONFIG;
}