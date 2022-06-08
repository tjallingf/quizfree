<?php 
    include_once("{$_SERVER['DOCUMENT_ROOT']}/quizlet/autoload.php");
    header('Content-Type: application/json');
?>
<?php 
    if(!isset($_POST['set_id'])) {
        exit_error('Expected query parameter set_id not specified.');
    }

    $info = \Quizlet\Sets\info(basename($_POST['set_id']));

    // Something went wrong ($info is HTTP status code)
    if(is_numeric($info)) {
        exit_error("Status code was not successful {$info}");
    } else {
       exit_success($info);
    }
?>