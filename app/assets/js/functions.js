function isSet(variable) {
    return !(variable === null || typeof variable == 'undefined');
}

function arrayColumn(array, column) {
    return array.map(item => item[column]);
}

function getTemplate(template) {
    return $(`[data-template="${template}"]`).first().clone(true).removeAttr('data-template');
}

function randomProperty(obj) {
    const keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
}

function randomItem(array) {
    return array[Math.floor((Math.random()*array.length))];
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

$.fn.shuffleChildren = function() {
    $.each(this.get(), function(index, el) {
        var $el = $(el);
        var $find = $el.children();

        $find.sort(function() {
            return 0.5 - Math.random();
        });

        $el.empty();
        $find.appendTo($el);
    });
};