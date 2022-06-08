<?php 
    namespace Quizlet\Sets;

    function info($id) {
        $client = new \GuzzleHttp\Client([
            'base_uri' => 'https://quizlet.com'
        ]);

        // For list of cards and quizlet title
        $response = $client->request(
            'GET', 
            "https://quizlet.com/{$id}/learn/", 
            ['http_errors' => false]
        );

        // For creator name
        $response2 = $client->request(
            'GET',
            "https://quizlet.com/nl/{$id}/",
            ['http_errors' => false] 
        );

        // Check if request was successful
        $status_code = $response->getStatusCode();
        if($status_code != 200) {
            return $status_code;
        }

        $body = $response->getBody();
        $body2 = $response2->getBody();

        // Extract title
        preg_match('/(?<=<title>Learn: )[\S ]+(?= \| Quizlet<\/title>)/', $body, $matches);
        $title = substr($matches[0] ?? null, 0, 40);

        // Extract creator name
        preg_match('/(?<="><span class="UserLink-username">).*?(?=<\/span)/', $body2, $matches);
        $creator_name = substr($matches[0] ?? null, 0, 20);

        // Extract creator url
        preg_match('/(?<=<div class="UserLink-content"><a class="UILink" href="\/).*?(?=")/', $body2, $matches);
        $creator_url = substr($matches[0] ?? null, 0, 20);

        // Get list of cards
        $first_mark  = 'assistantModeData"] = ';
        $second_mark = '; QLoad';

        // Extract card json
        preg_match(
            "/{$first_mark}(.*){$second_mark}/", 
            $body,
            $matches
        );

        
        $cards_json = isset($matches[0])
            ? substr($matches[0], strlen($first_mark), strlen($matches[0]) - strlen($first_mark) - strlen($second_mark))
            : '[]';

        // Decode card json
        $cards = json_decode($cards_json, true)['studiableDocumentData']['studiableItems'] ?? [];

        return [
            'info' => [
                'title' => $title,
                'creator' => [
                    'name' => $creator_name,
                    'url'  => $creator_url
                ]
            ],
            'cards' => $cards];
    }
?>