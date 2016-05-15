/**
 * Created by chimwemwe on 11/10/15.
 */

module.exports = function (router) {

    var fs = require("fs");

    var url = require('url');

    var mkdirp = require('mkdirp');

    var clj_fuzzy = require('clj-fuzzy');

    var pageSize = 10;

    if (Array.prototype.includes == null) Array.prototype.includes = function (term) {

        var found = false;

        for (var i = 0; i < this.length; i++) {

            if (this[i] == term) {

                found = true;

                break;

            }

        }

        return found;

    }

    function classify(keyword, group) {

        for (var i = 1; i < keyword.length; i++) {

            var str = keyword.substring(0, i);

            var soundex = clj_fuzzy.phonetics.soundex(str);

            if (!group[soundex]) {

                group[soundex] = {};

            }

            group[soundex][keyword] = true;

        }

        return group;

    }

    router.route('/')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            res.render('index', {title: "Reference Definitions"});

        })

    router.route('/new')
        .get(function (req, res) {

            res.render('new', {title: "Reference Definitions"});

        })

    router.route('/edit/:id')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var topics = {};

            if (fs.existsSync(__dirname + "/../public/data/topics.json")) {

                topics = require(__dirname + "/../public/data/topics.json");

            }

            var keywords = topics[req.params.id];

            var articles = {};

            if (fs.existsSync(__dirname + "/../public/data/articles.json")) {

                articles = require(__dirname + "/../public/data/articles.json");

            }

            var article = articles[req.params.id];

            var topicConcepts = {};

            if (fs.existsSync(__dirname + "/../public/data/topic_concepts.json")) {

                topicConcepts = require(__dirname + "/../public/data/topic_concepts.json");

            }

            var conceptList = topicConcepts[req.params.id];

            console.log(conceptList);

            res.render('edit', {title: "Reference Definitions", topic: req.params.id, keywords: keywords,
                article: article, defaults: JSON.stringify(conceptList)});

        })

    router.route('/topics/:id')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            var topics = {};

            if (fs.existsSync(__dirname + "/../public/data/topics.json")) {

                topics = JSON.parse(fs.readFileSync(__dirname + "/../public/data/topics.json"));

            }

            var topicConcepts = {};

            if (fs.existsSync(__dirname + "/../public/data/topic_concepts.json")) {

                topicConcepts = JSON.parse(fs.readFileSync(__dirname + "/../public/data/topic_concepts.json"));

            }

            var keys = Object.keys(topics);

            var page = parseInt(req.params.id) - 1;

            var result = {
                data: [],
                total: keys.length,
                pages: Math.ceil(keys.length / pageSize),
                page: page + 1
            };

            var limit = ((page * pageSize) + pageSize);

            var start = page * pageSize;

            if (limit > keys.length) {

                limit = keys.length;

            }

            for (var i = start; i < limit; i++) {

                var key = keys[i];

                var data = {};

                data[key] = {};

                data[key]["keywords"] = topics[key];

                data[key]["concepts"] = topicConcepts[key];

                result.data.push(data);

            }

            res.status(200).json(result)

        })

    router.route('/keywords/:id')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            var topics = {};

            if (fs.existsSync(__dirname + "/../public/data/keywords.json")) {

                topics = JSON.parse(fs.readFileSync(__dirname + "/../public/data/keywords.json"));

            }

            var keys = Object.keys(topics);

            var page = parseInt(req.params.id) - 1;

            var result = {
                data: [],
                total: keys.length,
                pages: Math.ceil(keys.length / pageSize),
                page: page + 1
            };

            var limit = ((page * pageSize) + pageSize);

            var start = page * pageSize;

            if (limit > keys.length) {

                limit = keys.length;

            }

            for (var i = start; i < limit; i++) {

                var key = keys[i];

                var data = {};

                data[key] = topics[key];

                result.data.push(data);

            }

            res.status(200).json(result)

        })

    router.route('/update')
        .post(function (req, res) {

            console.log(req.body)

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var keywords = {};

            if (fs.existsSync(__dirname + "/../public/data/keywords.json")) {

                keywords = require(__dirname + "/../public/data/keywords.json");

            }

            var articles = {};

            if (fs.existsSync(__dirname + "/../public/data/articles.json")) {

                articles = require(__dirname + "/../public/data/articles.json");

            }

            var topics = {};

            if (fs.existsSync(__dirname + "/../public/data/topics.json")) {

                topics = require(__dirname + "/../public/data/topics.json");

            }

            var classifications = {};

            if (fs.existsSync(__dirname + "/../public/data/classifications.json")) {

                classifications = require(__dirname + "/../public/data/classifications.json");

            }

            var concepts = {};

            if (fs.existsSync(__dirname + "/../public/data/concepts.json")) {

                concepts = require(__dirname + "/../public/data/concepts.json");

            }

            var topicConcepts = {};

            if (fs.existsSync(__dirname + "/../public/data/topic_concepts.json")) {

                topicConcepts = require(__dirname + "/../public/data/topic_concepts.json");

            }

            var params = req.body;

            if (typeof(params.symptom) == "string") {

                if (keywords[params.symptom]) {

                    if (!keywords[params.symptom].includes(params.topic)) {

                        keywords[params.symptom].push(params.topic);

                    }

                } else {

                    keywords[params.symptom] = [params.topic];

                }

                classifications = classify(params.symptom, classifications);

            } else {

                for (var i = 0; i < params.symptom.length; i++) {

                    var symptom = params.symptom[i];

                    if (keywords[symptom]) {

                        if (!keywords[symptom].includes(params.topic)) {

                            keywords[symptom].push(params.topic);

                        }

                    } else {

                        keywords[symptom] = [params.topic];

                    }

                    classifications = classify(symptom, classifications);

                }

            }

            if (typeof(params.concepts) == "string") {

                if (concepts[params.concepts]) {

                    if (!concepts[params.concepts].includes(params.topic)) {

                        concepts[params.concepts].push(params.topic);

                    }

                } else {

                    concepts[params.concepts] = [params.topic];

                }

                if (topicConcepts[params.concepts]) {

                    if (!topicConcepts[params.topic].includes(params.concepts)) {

                        topicConcepts[params.topic].push(params.concepts);

                    }

                } else {

                    topicConcepts[params.topic] = [params.concepts];

                }

            } else {

                for (var i = 0; i < params.concepts.length; i++) {

                    var concept = params.concepts[i];

                    if (concepts[concept]) {

                        if (!concepts[concept].includes(params.topic)) {

                            concepts[concept].push(params.topic);

                        }

                    } else {

                        concepts[concept] = [params.topic];

                    }

                    if (topicConcepts[params.topic]) {

                        if (!topicConcepts[params.topic].includes(concept)) {

                            topicConcepts[params.topic].push(concept);

                        }

                    } else {

                        topicConcepts[params.topic] = [concept];

                    }

                }

            }

            articles[params.topic] = params.article;

            topics[params.topic] = (typeof(params.symptom) == "string" ? [params.symptom] : params.symptom);

            fs.writeFile(__dirname + "/../public/data/keywords.json", JSON.stringify(keywords), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            fs.writeFile(__dirname + "/../public/data/articles.json", JSON.stringify(articles), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            fs.writeFile(__dirname + "/../public/data/topics.json", JSON.stringify(topics), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            fs.writeFile(__dirname + "/../public/data/classifications.json", JSON.stringify(classifications), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            fs.writeFile(__dirname + "/../public/data/concepts.json", JSON.stringify(concepts), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            fs.writeFile(__dirname + "/../public/data/topic_concepts.json", JSON.stringify(topicConcepts), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            res.redirect("/");

        })

    router.route('/destroy/:id')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var keywords = {};

            if (fs.existsSync(__dirname + "/../public/data/keywords.json")) {

                keywords = require(__dirname + "/../public/data/keywords.json");

            }

            var articles = {};

            if (fs.existsSync(__dirname + "/../public/data/articles.json")) {

                articles = require(__dirname + "/../public/data/articles.json");

            }

            var topics = require(__dirname + "/../public/data/topics.json");

            if (fs.existsSync(__dirname + "/../public/data/topics.json")) {

                topics = require(__dirname + "/../public/data/topics.json");

            }

            var concepts = {};

            if (fs.existsSync(__dirname + "/../public/data/concepts.json")) {

                concepts = require(__dirname + "/../public/data/concepts.json");

            }

            var topicConcepts = {};

            if (fs.existsSync(__dirname + "/../public/data/topic_concepts.json")) {

                topicConcepts = require(__dirname + "/../public/data/topic_concepts.json");

            }

            delete articles[req.params.id];

            fs.writeFile(__dirname + "/../public/data/articles.json", JSON.stringify(articles), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            delete topics[req.params.id];

            fs.writeFile(__dirname + "/../public/data/topics.json", JSON.stringify(topics), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            var keys = Object.keys(keywords);

            for (var i = 0; i < keys.length; i++) {

                var key = keys[i];

                var index = keywords[key].indexOf(req.params.id);

                if (index >= 0) {

                    keywords[key].splice(index, 1);

                }

                if (keywords[key].length <= 0) {

                    delete keywords[key];

                }

            }

            fs.writeFile(__dirname + "/../public/data/keywords.json", JSON.stringify(keywords), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });


            var keys = Object.keys(concepts);

            for (var i = 0; i < keys.length; i++) {

                var key = keys[i];

                var index = concepts[key].indexOf(req.params.id);

                if (index >= 0) {

                    concepts[key].splice(index, 1);

                }

                if (concepts[key].length <= 0) {

                    delete concepts[key];

                }

            }

            fs.writeFile(__dirname + "/../public/data/concepts.json", JSON.stringify(concepts), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            delete topicConcepts[req.params.id];

            fs.writeFile(__dirname + "/../public/data/topic_concepts.json", JSON.stringify(topicConcepts), function (err, file) {

                if (err) {

                    console.log(err.message);

                }

            });

            var keys = Object.keys(topics);

            var page = 0;

            var result = {
                data: [],
                total: keys.length,
                pages: Math.ceil(keys.length / pageSize),
                page: page + 1
            };

            var limit = ((page * pageSize) + pageSize);

            var start = page * pageSize;

            if (limit > keys.length) {

                limit = keys.length;

            }

            for (var i = start; i < limit; i++) {

                var key = keys[i];

                var data = {};

                data[key] = {};

                data[key]["keywords"] = topics[key];

                data[key]["concepts"] = topicConcepts[key];

                result.data.push(data);

            }

            res.status(200).json(result)

        })

    router.route('/query/:id')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            var classifications = {};

            if (fs.existsSync(__dirname + "/../public/data/classifications.json")) {

                classifications = JSON.parse(fs.readFileSync(__dirname + "/../public/data/classifications.json"));

            }

            var soundex = clj_fuzzy.phonetics.soundex(query.s);

            var keys = [];

            if (classifications[soundex]) {

                keys = Object.keys(classifications[soundex]);

            }

            var page = parseInt(req.params.id) - 1;

            var result = {
                data: [],
                total: keys.length,
                pages: Math.ceil(keys.length / pageSize),
                page: page + 1
            };

            var limit = ((page * pageSize) + pageSize);

            var start = page * pageSize;

            if (limit > keys.length) {

                limit = keys.length;

            }

            for (var i = start; i < limit; i++) {

                var key = keys[i];

                result.data.push(key);

            }

            /*
             var result = {
             data: [],
             total: keys.length,
             pages: Math.ceil(keys.length / pageSize),
             page: page + 1
             };

             var limit = ((page * pageSize) + pageSize);

             var start = page * pageSize;

             if (limit > keys.length) {

             limit = keys.length;

             }

             for (var i = start; i < limit; i++) {

             var key = keys[i];

             var data = {};

             data[key] = {};

             data[key]["keywords"] = topics[key];

             data[key]["concepts"] = topicConcepts[key];

             result.data.push(data);

             }
             */

            res.status(200).json(result)

        })

    router.route('/references/:id')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var url_parts = url.parse(req.url, true);

            var query = url_parts.query;

            var keywords = {};

            if (fs.existsSync(__dirname + "/../public/data/keywords.json")) {

                keywords = require(__dirname + "/../public/data/keywords.json");

            }

            var topics = {};

            var keys = JSON.parse(query.s);

            console.log(keys);

            for (var i = 0; i < keys.length; i++) {

                if (keywords[keys[i]]) {

                    for (var j = 0; j < keywords[keys[i]].length; j++) {

                        var topic = keywords[keys[i]][j];

                        if (!topics[topic]) {

                            topics[topic] = 0;

                        }

                        topics[topic]++;

                    }

                }

            }

            var tuples = [];

            for (var key in topics) tuples.push([key, topics[key]]);

            tuples.sort(function (a, b) {
                a = a[1];
                b = b[1];

                return a < b ? -1 : (a > b ? 1 : 0);
            }).reverse();

            console.log(tuples);

            var page = parseInt(req.params.id) - 1;

            var result = {
                data: [],
                total: tuples.length,
                pages: Math.ceil(tuples.length / pageSize),
                page: page + 1
            };

            var limit = ((page * pageSize) + pageSize);

            var start = page * pageSize;

            if (limit > tuples.length) {

                limit = tuples.length;

            }

            for (var i = start; i < limit; i++) {

                var key = tuples[i];

                result.data.push(key);

            }

            res.status(200).json(result)

        })


    router.route('/fetchTopic/:id')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            var articles = {};

            if (fs.existsSync(__dirname + "/../public/data/articles.json")) {

                articles = require(__dirname + "/../public/data/articles.json");

            }

            var article = articles[req.params.id.toString()];

            console.log(article);

            res.status(200).json({article: article, topic: req.params.id});

        });

    router.route('/list_by_keyword')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            res.render('list_by_keyword', {title: "Reference Content By Keyword"});

        })

    router.route('/list_by_topic')
        .get(function (req, res) {

            var dir = __dirname + "/../public/data";

            mkdirp(dir, function (err) {

                // path was created unless there was error

            });

            res.render('list_by_topic', {title: "Reference Content By Topic"});

        })

    router.route('/concepts')
        .get(function (req, res) {

            var config = require(__dirname + "/../config/database.json");

            var knex = require('knex')({
                client: 'mysql',
                connection: {
                    host: config.host,
                    user: config.user,
                    password: config.password,
                    database: config.database
                }
            });

            knex.select('name').from('concept_name')
                .then(function (names) {

                    var data = [];

                    for(var i =0; i < names.length; i++) {

                        data.push(names[i].name);

                    }

                    res.status(200).json(data);

                })
                .catch(function(err) {

                    console.log(err.message);

                    res.status(404).json(JSON.stringify(err));

                })

        })

    return router;

}