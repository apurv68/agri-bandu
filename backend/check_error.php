<?php
$ch = curl_init('https://agri-bandu-2.onrender.com/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$res = curl_exec($ch);

if (preg_match_all('/<span class="exception_title">(.*?)<\/span>|<div class="title_problem">(.*?)<\/div>|<h1[^>]*>(.*?)<\/h1>/s', $res, $matches)) {
    print_r($matches[0]);
} else {
    echo strip_tags(substr($res, 0, 1500));
}
