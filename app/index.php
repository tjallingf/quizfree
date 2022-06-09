<?php 
    include("{$_SERVER['DOCUMENT_ROOT']}/quizlet/autoload.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include(ROOT.'/assets/php/includes/head.html'); ?>

    <title>Leren - Quizlet</title>
</head>
<body class="pt-5">
    <main class="container justify-content-center">
        <form onsubmit="event.preventDefault();">
            <div class="mb-3">
                <input id="quizlet-set-link" list="quizlet-recent-sets" class="form-control" placeholder="Vul hier de link naar een Quizlet in" type="text">
                <datalist id="quizlet-recent-sets"></datalist>
                <small class="whitespace-nowrap">Bijvoorbeeld: https://quizlet.com/nl/123456789/een-quizlet/</small>
            </div>
            <button class="btn btn-primary" onclick="quizletOpenSetFromUrl($('#quizlet-set-link').val(), 'learn');">
                <i class="fal fa-graduation-cap mr-1"></i>
                Leren
            </button>
            of
            <button class="btn btn-primary" onclick="quizletOpenSetFromUrl($('#quizlet-set-link').val(), 'write');">
                <i class="fal fa-pencil-alt mr-1"></i>
                Schrijven
            </button>
        </form>
    </main>
    <script>
        $(document).ready(function() {
            const $datalist = $('#quizlet-recent-sets');

            $.each(localStorage, function(key, value) {
                if(!key.startsWith('quizlet-') || !key.endsWith('-info')) {
                    return true;
                }

                const setId = key.substring(8, 17);
                const setTitle = JSON.parse(value)['title'] || null;

                $datalist.append(`<option value="https://quizlet.com/${setId}/">${setTitle}</option>`);
            })
        })
    </script>
</body>
</html>