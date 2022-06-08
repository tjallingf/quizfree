<?php 
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Credentials: true');

    date_default_timezone_set('Europe/Amsterdam');

    define('ROOT', rtrim(__DIR__, '/'));

    include(ROOT.'/vendor/autoload.php');
    include(ROOT.'/assets/php/Quizlet/autoload.php');
    include(ROOT.'/assets/php/functions.php');
?>