# Quizlet Unlocked

The popular studying app [Quizlet[(https://quizlet.com) decided to restrict access to most popular 
studying modes (learn and write) and only allow full access to Quizlet Plus users. Since I often use
Quizlet for studying and I didn't want to pay for it I created this simple website for bypassing these restrictions.

## How it works
Once you enter the URL to the Quizlet set you want to study, the ID of this set is extracted using a simple [regex](https://en.wikipedia.org/wiki/Regular_expression)
detecting the first 9 numbers occuring in the URL. The server then makes a request to the page you would normally load 
in your web browser. All cards contained in the set are then [scraped](https://en.wikipedia.org/wiki/Web_scraping) from the response body.

## Data storage
No userdata or information is stored on our systems. All cards, progress and other data that might be required for the app to 
function correctly is kept only on your machine, since I decided that I wanted this to be nothing more than just a simple tool.
