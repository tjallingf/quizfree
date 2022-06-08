<?php 
    include("{$_SERVER['DOCUMENT_ROOT']}/quizlet/autoload.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include(ROOT.'/assets/php/includes/head.html'); ?>

    <title>Leren - Quizlet</title>

    <script>
        $(document).ready(function() {
            quizletOpenSet('<?php echo($_GET['id'] ?? null); ?>');
        })
    </script>
</head>
<body>
    <div class="quizlet-progress-bar" id="quizlet-progress-bar-total">
        <div class="quizlet-progress-bar-inner bg-success"></div>
    </div>
    <main class="container justify-content-center pt-3">
        <h1 id="quizlet-set-title">
            <i class="fal fa-circle-notch fa-spin text-primary"></i>
        </h1>
        <span id="quizlet-set-subtitle" class="text-muted">
            Gemaakt door <span id="quizlet-set-creator">
                <i class="fal fa-circle-notch fa-spin text-primary"></i>
            </span>
        </span>
        <div id="quizlet-scene-mc" class="quizlet-scene" style="display: none;">
            <h5 class="mt-3 mb-1 quizlet-question-heading">Woord</h5>
            <div id="quizlet-mc-question" class="quizlet-mc-question"></div>
            <h5 class="mt-3 mb-1 quizlet-answer-heading">Betekenis</h5>
            <div id="quizlet-mc-answers" class="row quizlet-mc-cards-wrapper"></div>
        </div>
        <div id="quizlet-scene-writable" class="quizlet-scene" style="display: none;">
            <div class="d-flex flex-column flex-md-row mt-3 mb-1">
                <h5 class="mb-0" id="quizlet-writable-question"></h5>
                <h5 class="mb-0 ml-md-auto"><i class="text-muted">Antwoord in het <span class="quizlet-answer-heading">Betekenis</span></i></h5>
            </div>
            <input id="quizlet-writable-input" class="form-control quizlet-mc-question type="text" onchange="quizletConfirmWritable($(this).val());" placeholder="Typ het antwoord hier...">
            <div id="quizlet-writable-answer" class="quizlet-mc-question mb-0"">
                <span id="quizlet-writable-corr-answer" class="text-muted"></span>
                <i id="quizlet-writable-user-answer"></i>
            </div>
            <span id="quizlet-writable-mark-answer-correct" class="text-success cursor-pointer" onclick="quizletMarkWritableAnswerCorrect();" style="display: none;" title="Als juist markeren (Sneltoets: Spatie)">
                Ik had het juist
            </div>
        </div>
        <div id="quizlet-scene-celebration" class="quizlet-scene" style="display: none;">
            <h2 id="quizlet-celebration-title">Je bent klaar!</h2>
            <i id="quizlet-celebration-icon" class="fal fa-10x fa-trophy text-warning py-4"></i>
            <button class="d-block mx-auto btn btn-primary mt-3" onclick="quizletRedo();">
                <i class="fal fa-redo mr-1"></i>
                Opnieuw leren
            </button>
        </div>
        <button id="quizlet-btn-continue" class="btn btn-round btn-success btn-floating btn-animated" onclick="quizletUpdateScene();" title="Sneltoets: Enter">
            <i class="fal fa-chevron-right"></i>
        </button>
        <button id="quizlet-btn-settings" class="btn btn-round btn-primary btn-floating" title="Instellingen">
            <i class="fal fa-cog"></i>
        </button>
        <div id="quizlet-settings">
            <div class="quizlet-settings-group mb-2" data-setting="answerWith">
                <h5>Antwoorden met</h5>
                <div class="btn-group">
                    <button class="btn btn-secondary quizlet-btn-setting" id="quizlet-settings-answer-with-word" data-value="word">Woord</button>
                    <button class="btn btn-primary quizlet-btn-setting" id="quizlet-settings-answer-with-definition" data-value="definition">Definitie</button>
                </div>
            </div>
            <div class="quizlet-settings-group" data-setting="mode">
                <h5>Modus</h5>
                <div class="btn-group">
                    <button class="btn btn-primary quizlet-btn-setting" data-value="learn">Leren</button>
                    <button class="btn btn-secondary quizlet-btn-setting" data-value="write">Schrijven</button>
                </div>
            </div>
        </div>
    </main>

    <!-- Templates -->
    <div data-template="quizlet-mc-card" class="col-12 col-md-6 quizlet-mc-card">
        <div class="quizlet-mc-card-inner">
            <span class="card-icon"></span>
            <span class="card-body"></span>
        </div>
    </div>
</body>
</html>