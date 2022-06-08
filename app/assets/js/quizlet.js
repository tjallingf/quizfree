const quizlet = {
    api: {
        request(url, data) {
            url = `/quizlet/api/${url}/`;

            return new Promise((resolve, reject) => {
                $.ajax({
                    method: 'POST',
                    url: url,
                    data: data,
                    headers: {'Accept': '*/*'},
					cache: false,
                    success: function(response) {
                        resolve(response?.data);
                        return;
                    },
                    error: function(response) {
                        console.error(`Request to url ${url} failed: ${response?.responseJSON?.message || null}`);
                        reject(response?.responseJSON?.message);
                        return;
                    }
                })
            })
        }
    },

    sets: {
        setIdFromUrl(url) {
            const matches = url.match(/[0-9]{9}/g);

            if(!isSet(matches) || matches.length < 1) {
                return null;
            }

            return matches[0];
        }
    },

    storage: {
        set(key, value) {
            if(key == 'setId') {
                localStorage.setItem('quizlet-setId', value);
                return true;
            }

            const setId = quizlet.storage.get('setId');
            localStorage.setItem(`quizlet-${setId}-${key}`, JSON.stringify(value));
            return true;
        },

        get(key) {
            if(key == 'setId') {
                return localStorage.getItem('quizlet-setId');
            }

            const setId = quizlet.storage.get('setId');
            return JSON.parse(localStorage.getItem(`quizlet-${setId}-${key}` || '[]'));
        }
    }
}