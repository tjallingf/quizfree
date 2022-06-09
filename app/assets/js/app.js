const QUESTIONS_PER_ROUND               = 6;
const RE_ASK_CARD_AFTER_CARD_AMOUNT_MIN = 4;
const RE_ASK_CARD_AFTER_CARD_AMOUNT_MAX = 6;
const CORRECT_CARD_CONTINUE_DELAY_MS    = 250;
const SUPPORTED_LANGUAGES               = {
    'de': 'Duits', 
    'el': 'Grieks',
    'en': 'Engels', 
    'es': 'Spaans', 
    'fr': 'Frans', 
    'fy': 'Fries', 
    'la': 'Latijn', 
    'nl': 'Nederlands'
};

function quizletOpenSetFromUrl(url, mode = 'learn') {
    const id = quizlet.sets.setIdFromUrl(url);
    if(!isSet(id) || id.length != 9) {
        alert('De link die je hebt ingevuld is ongeldig.');
        return;
    }

    // Determine mode
    quizlet.storage.set('setting-mode', mode == 'write' ? 'write' : 'learn');

    window.location.href = `learn/?id=${id}&mode=${mode}`;
}

function quizletOpenSet(setId) {
    console.log(`Opening set ${setId} with mode ${quizlet.storage.get('setting-mode')}`);
    
    quizlet.storage.set('setId', setId);

    // Check if the set has already been loaded
    const info  = quizlet.storage.get('info');
    const cards = quizlet.storage.get('cards');

    if(isSet(info) && isSet(cards) && cards != []) {
        console.log(`Loaded set ${setId} from localStorage.`);
        quizletStart();
        return true;
    }

    quizlet.api.request('set/info', {set_id: setId}).then(response => {
        const $wrapper = $('#quizlet-scene-mc #quizlet-mc-answers');
        let cards      = {};

        // Store cards by id
        $.each(response.cards, function(i, card) {
            card.state     = 0;
            cards[card.id] = card;
        });
        
        quizlet.storage.set('info', response.info);
        quizlet.storage.set('cards', cards);

        console.log(`Loaded set ${setId} from server.`);

        quizletStart();
    }).catch(err => {
        console.error('Er is iets misgegegaan waardoor de Quizlet set niet kon worden geladen:', err);
        alert('De set kon niet worden geladen. Weet je zeker dat deze Quizlet set bestaat?');
    })
}

function quizletStart() {
    quizletUpdateScene();
    quizletRefreshProgressBar();
    quizletApplySetInfoToInterface();
    quizletRefreshSettingsInterface();
}

function quizletApplySetInfoToInterface() {
    const info  = quizlet.storage.get('info');
    const cards = quizlet.storage.get('cards');

    // Get first card
    const card = cards[Object.keys(cards)[0]];
    
    // Find languages for this card
    $.each(card.cardSides, function(cardIndex, cardSide) {
        const media = cardSide.media[0];
        if(!isSet(media)) {
            return true;
        }
        
        const languageCode = media.languageCode;
        const languageName = SUPPORTED_LANGUAGES[languageCode];

        if(!isSet(languageName)) {
            return true;
        }


        // Detemine if the user wants to answer with word or definition
        const answerWith = quizlet.storage.get('setting-answerWith') || 'definition';

        if(cardIndex == 0) {
            // Word
            $('#quizlet-settings-answer-with-word').text(languageName);

            $(`.quizlet-${answerWith == 'word' ? 'answer' : 'question'}-heading`).text(languageName);
        } else {
            // Definition
            $('#quizlet-settings-answer-with-definition').text(languageName);

            $(`.quizlet-${answerWith == 'definition' ? 'answer' : 'question'}-heading`).text(languageName);
        }
    })

    // Set set title
    $('#quizlet-set-title').text(info.title);
    $('#quizlet-set-creator').html(`<a target="_blank" rel="noopener noreferrer" href="https://quizlet.com/${info.creator.url}">${info.creator.name}</a>`);
}

function quizletOpenSettings() {
    const $btn = $('#quizlet-btn-settings');
    const $settings = $('#quizlet-settings');
    $btn.addClass('focus').find('i').addClass('fa-rotate-180');
    $settings.addClass('show');
}

function quizletCloseSettings() {
    const $btn      = $('#quizlet-btn-settings');
    const $settings = $('#quizlet-settings');
    $btn.removeClass('focus').find('i').removeClass('fa-rotate-180');
    $settings.removeClass('show');   
}

function quizletRefreshSettingsInterface() {
    const $settings = $('#quizlet-settings');
    $settings.find('.quizlet-settings-group').each(function(i, group) {
        const $group  = $(group);
        const key     = $group.attr('data-setting');
        const value   = quizlet.storage.get(`setting-${key}`);
        const $btn    = $group.find(`[data-value="${value}"]`);
        
        $btn.siblings().removeClass('btn-primary').addClass('btn-secondary');
        $btn.addClass('btn-primary').removeClass('btn-secondary');
    })
}

$(document).on('click', '#quizlet-btn-settings', function() {
    const $btn = $(this);

    if($btn.hasClass('focus')) {
        quizletCloseSettings();
    } else {
        quizletOpenSettings();
    }
})

$(document).on('click', function(e) {
    const $target = $(e.target);

    if(!$target.closest('#quizlet-settings').length && !$target.closest('#quizlet-btn-settings').length) {
        quizletCloseSettings();
    }
})

$(document).on('click', '.quizlet-btn-setting:not(.btn-primary)', function() {
    const $btn  = $(this);
    const value = $btn.attr('data-value');
    const key   = $btn.closest('.quizlet-settings-group').attr('data-setting');

    if(!isSet(value) || !isSet(key)) {
        return;
    }

    quizlet.storage.set(`setting-${key}`, value);

    quizletRefreshSettingsInterface();
    
    // Reload application
    quizletStart();
});

function quizletShowScene(scene) {
    $('.quizlet-scene').hide();
    $(`#quizlet-scene-${scene}`).show();
}

function quizletUpdateScene() {
    const newQuestion = quizletUpdateQuestion();

    if(newQuestion == false) {
        // User has finished the set
        quizletCelebrate();
    }

    if(!isSet(newQuestion.card)) {
        return;
    }

    console.log('Updating scene!');

    // Clean up scenes
    $('#quizlet-writable-input').val('').show(); 
    $('#quizlet-writable-answer').hide();
    $('#quizlet-writable-user-answer').removeClass('text-success text-danger');
    $('#quizlet-writable-corr-answer').text('');
    $('#quizlet-writable-mark-answer-correct').hide();
    $('#quizlet-btn-continue').removeClass('show');
    $('#quizlet-mc-answers').empty();

    if(newQuestion.questionType == 'multipleChoice') {
        if(!quizletUpdateAnswers(newQuestion.card)) {
            return quizletUpdateScene();
        }
    } else {
        if(!quizletUpdateInput(newQuestion.card)) {
            return quizletUpdateScene();
        }
    }

    return true;
}

function quizletCelebrate() {
    quizletRefreshProgressBar(100000);
    quizletShowScene('celebration');
    $('#quizlet-btn-continue').hide();
}

function quizletRedo() {
    let cards = quizlet.storage.get('cards');

    $.each(cards, function(i, card) {
        card.state = 0;
    });

    quizlet.storage.set('cards', cards);

    quizletStart();

    return true;
}

function quizletGetHighestPriorityCard(ignoreMinCardIndex = false) {
    const cards = quizletGetCardsByState(ignoreMinCardIndex);
    // Get a card that hasn't been used yet
    let possibleCards = [];

    if(cards[2].length > 0) {
        // Prefer cards that have already been correctly anwered using multiple choice
        possibleCards = cards[2];
    } else {
        if(cards[1].length > 0) {
            // Cards that have been answered incorrectly using multiple choice
            possibleCards = cards[1];
        } else if(cards[0].length > 0) {
            // Cards that haven't been answered yet
            possibleCards = cards[0];
        } else {
            // See if the set has been finished
            if(ignoreMinCardIndex) {
                return false;
            }

            const allCards = quizletGetCardsByState(true);
            if(allCards[0].length > 0 || allCards[1].length > 0 || allCards[2].length > 0){
                return quizletGetHighestPriorityCard(true);
            }
        }
    }

    const card = randomItem(possibleCards);

    if(!isSet(card)) {
        return false;
    }

    return card;
}

function quizletUpdateQuestion() {
    const card = quizletGetHighestPriorityCard();

    if(card == false) {
        return false;
    }

    // Detemine if the word or the definition should be asked
    const answerWith        = quizlet.storage.get('setting-answerWith') || 'definition';
    const answerSideIndex   = answerWith == 'word' ? 0 : 1; 

    // questionSideIndex is opposite of answerSideIndex
    const questionSideIndex = 1 - answerSideIndex;  

    // Show the question
    const $question = $('#quizlet-mc-question');
    $question.text(card?.cardSides[questionSideIndex]?.media[0]?.plainText);

    // Increment cardIndex by one
    const cardIndex = parseInt(quizlet.storage.get('cardIndex')) || 0;
    quizlet.storage.set('cardIndex', cardIndex + 1);

    // Store id of card
    quizlet.storage.set('cardId', card.id);

    const mode = quizlet.storage.get('setting-mode') || 'learn';
    let questionType;
    
    // Force write questions if the mode was set to write
    if(mode == 'write') {
        questionType = 'write';
    } else {
        questionType = card.state == 2 ? 'write' : 'multipleChoice';
    }

    return {card: card, questionType: questionType};
}

function quizletUpdateAnswers(correctCard) {
    quizletShowScene('mc'); // Multiple choice

    let cards = quizlet.storage.get('cards');

    // Prevent double answers
    delete cards[correctCard.id];

    const $answers = $('#quizlet-mc-answers');

    // Show correct answer
    quizletAddAnswer(correctCard, true);

    // Show 3 more answers for a total of 4
    for (let i = 0; i < 3; i++) {
        const randomCard = randomProperty(cards);
        quizletAddAnswer(randomCard, false);

        // Prevent double answers
        delete cards[randomCard.id];
    }
    
    // Shuffle answers
    $answers.shuffleChildren();

    // Set answer icons
    $.each($answers.children(), function(i, answer) {
        const $answer = $(answer);
        const index   = $answer.index()+1;

        // Set icon
        $answer.find('.card-icon').text(index);
        $answer.attr('title', `Sneltoets: ${index}`);
    })

    return true;
}

function quizletConfirmWritable(userAnswer, continueIfCorrect = true) {
    let cards           = quizlet.storage.get('cards');
    const cardId        = quizlet.storage.get('cardId');
    const $input        = $('#quizlet-writable-input');
    const correctAnswer = $input.attr('data-answer');
    const isCorrect     = quizletSmartCompareWritableAnswer(userAnswer, correctAnswer);
    const cardIndex     = parseInt(quizlet.storage.get('cardIndex')) || 0;

    if(isCorrect == true) {
        // Mark the card as done
        console.info(`Card ${correctAnswer.toUpperCase()} was written correctly. It wil not be asked again.`);
        cards[cardId].state = 3;

        // Refresh the progress bar
        quizletRefreshProgressBar(1);
    
        // Go to next card automatically
        if(continueIfCorrect) {
            setTimeout(() => {
                quizletUpdateScene();
            }, CORRECT_CARD_CONTINUE_DELAY_MS);
        }
    } else if(isCorrect == 'semi') {
        console.info(`Card ${correctAnswer.toUpperCase()} was written correctly. It wil not be asked again.`);
        cards[cardId].state = 3;

        // Refresh the progress bar
        quizletRefreshProgressBar(1);
    
        $('#quizlet-btn-continue').addClass('show');
    } else {
        console.info(`Card ${correctAnswer.toUpperCase()} was written INCORRECTLY. It will be asked again using WRITING.`);
        // If the user hasn't answered correctly, set a cardIndex for when the 
        // card could be asked for again
        cards[cardId].minCardIndexForReAsk = cardIndex+random(RE_ASK_CARD_AFTER_CARD_AMOUNT_MIN, RE_ASK_CARD_AFTER_CARD_AMOUNT_MAX);
    
        $('#quizlet-btn-continue').addClass('show');
    }

    quizlet.storage.set('cards', cards);

    $('#quizlet-writable-input').hide();
    $('#quizlet-writable-answer').show().find('#quizlet-writable-user-answer').text(userAnswer).removeClass('text-success text-danger').addClass(isCorrect ? 'text-success' : 'text-danger');
    $('#quizlet-writable-corr-answer').text('');
    if(isCorrect !== true) {
        $('#quizlet-writable-answer').find('#quizlet-writable-corr-answer').text(correctAnswer);
        if(isCorrect === false) {
            $('#quizlet-writable-mark-answer-correct').show();
        }
    }

    return isCorrect;
}

function quizletRefreshProgressBar(incrementCurrentBy = 0) {
    const total = Object.keys(quizlet.storage.get('cards')).length
    const current    = quizletGetCardsByState()[3].length;
    const percentage = (current + incrementCurrentBy) / total * 100;
    $('#quizlet-progress-bar-total .quizlet-progress-bar-inner').css('width', percentage + '%');
}

function quizletSmartCompareWritableAnswer(userAnswer, corrAnswer) {
    userAnswer = quizletParseAnswer(userAnswer);
    corrAnswer = quizletParseAnswer(corrAnswer);

    console.log(userAnswer, corrAnswer);

    if(userAnswer.complete == corrAnswer.complete) {
        return true;
    }

    if(userAnswer.options.length == 0 && corrAnswer.options.length == 0) {
        return true;
    }

    // Check if the correct answer contains at least one of the options entered
    // by the user
    let optionsMatch = false;
    $.each(corrAnswer.options, function(i, option) {
        if(userAnswer.options.includes(option)) {
            optionsMatch = 'semi';
            return false;
        }
    })
    
    return optionsMatch;
}

function quizletParseAnswer(answer) {  
    const regexForSeperation       = /( \||\| |\|| ,|, |,| \/|\/ |\/| \-|\- |\-)/gm;
    const regexForSuperfluosSpaces = /\s\s+/gm;
    answer = answer
        .trim()
        .toLowerCase()
        .replaceAll(regexForSuperfluosSpaces, ' ')
        .replaceAll(regexForSeperation, '|');

    const complete = answer;

    // Main part is the part before the colon (or whole answer if a colon is not present)
    const main = answer.split(':')[0];
    let options = [];
    
    // Remove part before colon
    if(answer.indexOf(':') > -1) {
        answer = answer.split(':')[1];
    }

    // Split options
    options = answer.split('|');

    return {
        complete: complete,
        main: main,
        options: options
    }
}

function quizletMarkWritableAnswerCorrect() {
    const correctAnswer = $('#quizlet-writable-input').attr('data-answer');
    quizletConfirmWritable(correctAnswer, false);
    quizletUpdateScene();
    return true;
}

function quizletUpdateInput(card) {
    quizletShowScene('writable');

    const $input    = $('#quizlet-writable-input');
    const $question = $('#quizlet-writable-question');

    // Detemine if the word or the definition should be asked
    const answerWith        = quizlet.storage.get('setting-answerWith') || 'definition';
    const answerSideIndex   = answerWith == 'word' ? 0 : 1; 

    // questionSideIndex is opposite of answerSideIndex
    const questionSideIndex = 1 - answerSideIndex;  

    $question.text(card.cardSides[questionSideIndex]?.media[0]?.plainText);
    
    $input.attr('data-answer', card.cardSides[answerSideIndex]?.media[0]?.plainText);

    $input.focus();

    return true;
}

function quizletConfirmAnswer(cardId, continueIfCorrect = true) {
    let cards       = quizlet.storage.get('cards');
    const $cards    = $('#quizlet-mc-answers');
    const card      = cards[cardId];
    const $card     = $(`.quizlet-mc-card[data-id="${cardId}"]`);
    const isCorrect = $card.attr('data-correct') == 'true';
    const cardIndex = parseInt(quizlet.storage.get('cardIndex')) || 0;

    $card.addClass('quizlet-mc-card-active');
    $cards.find('[data-correct="true"]').addClass('quizlet-mc-card-active');

    if(isCorrect) {
        cards[cardId].state = 2;
        cards[cardId].minCardIndexForReAsk = cardIndex+random(RE_ASK_CARD_AFTER_CARD_AMOUNT_MIN, RE_ASK_CARD_AFTER_CARD_AMOUNT_MAX);
        console.info(`Card ${$card.find('.card-body').text().trim().toUpperCase()} was answered correctly. It will be asked again using WRITING.`);
        
        // Go to next card automatically
        if(continueIfCorrect) {
            setTimeout(() => {
                quizletUpdateScene();
            }, CORRECT_CARD_CONTINUE_DELAY_MS);
        }
    } else {
        cards[cardId].state = 1;
        cards[cardId].minCardIndexForReAsk = cardIndex+random(RE_ASK_CARD_AFTER_CARD_AMOUNT_MIN, RE_ASK_CARD_AFTER_CARD_AMOUNT_MAX);
        console.info(`Card ${$card.find('.card-body').text().trim().toUpperCase()} was answered INCORRECTLY. It will be asked again using MULTIPLE CHOICE.`);
        $('#quizlet-btn-continue').addClass('show');
    }

    quizlet.storage.set('cards', cards);

    
    return true;
}

function quizletAddAnswer(card, correct = false) {
    const $answers        = $('#quizlet-mc-answers');
    const $answer         = getTemplate('quizlet-mc-card');
    const answerWith      = quizlet.storage.get('setting-answerWith') || 'definition';
    const answerSideIndex = answerWith == 'word' ? 0 : 1;  

    $answer.attr({
        'data-id': card.id,
        'data-correct': correct,
        'onclick': `quizletConfirmAnswer('${card.id}')`
    });

    // Set title
    $answer.find('.card-body').text(card?.cardSides[answerSideIndex]?.media[0]?.plainText);

    $answer.appendTo($answers);
}

function quizletGetCardsByState(ignoreMinCardIndex = false) {
    const cards = quizlet.storage.get('cards');
    const cardIndex = parseInt(quizlet.storage.get('cardIndex')) || 0;
    let states = {0: [], 1: [], 2: [], 3: []};

    $.each(cards, function(i, card) {
        if(!isSet(card.state)) {
            card.state = 0;
        }

        if(!isSet(states[card.state])) {
            return true;
        }

        // Continue if the card can not be asked yet again
        if(ignoreMinCardIndex == false && isSet(card.minCardIndexForReAsk) && cardIndex < card.minCardIndexForReAsk) {
            return true;
        }

        states[card.state].push(card);
    })

    if(ignoreMinCardIndex == false && states[0].length == 0 && states[1].length == 0 && states[2].length == 0) {
        console.log('User has finished this set!');
        return quizletGetCardsByState(true);
    }

    return states;
}

$(document).on('keypress', function(e) {
    if($(e.target).is('input')) {
        return;
    }

    e.preventDefault();
    const key = e.key.toLowerCase();


    if(!isSet(key)) {
        return;
    }

    if(key == 'enter') {
        // Enter
        $('#quizlet-btn-continue.show').trigger('click');
    } else if(isNaN(key) === false && key != ' ') {
        // Numeric
        const $answers = $('#quizlet-mc-answers');
        $answers.find(`.quizlet-mc-card:nth-child(${key})`).trigger('click');
    } else if(key == ' ') {
        // Space
        $('#quizlet-writable-mark-answer-correct:not([style*="none"])').trigger('click');
    } else {
        return;
    }
    
})