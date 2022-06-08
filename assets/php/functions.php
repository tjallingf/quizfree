<?php 
    function exit_success($data) {
        http_response_code(200);
        exit(json_encode(['success' => true, 'data' => $data]));
        return true;
    }

    function exit_error($message) {
        http_response_code(400);
        exit(json_encode(['success' => false, 'message' => $message]));
        return true;
    }
?>