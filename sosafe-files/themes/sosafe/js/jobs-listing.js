jQuery(function($){

    var jobsByDepartment = [];
    var departmentList = [];
    var locationsList = [];

    initJobBoard();

    function initJobBoard() {

        jQuery.ajax({
            url: "https://api.ashbyhq.com/posting-api/job-board/sosafe",
            type: 'GET',
            dataType: 'json', // added data type
            success: function (response) {

                var jobsList = response.jobs;

                // console.log(response.jobs);
                
                jobsList.forEach(job => {

                    if (job.team in jobsByDepartment) {
                        jobsByDepartment[job.team].push(job);
                    } else {
                        jobsByDepartment[job.team] = [job];
                    }

                    if (!departmentList.includes(job.team)) {
                        departmentList.push(job.team);
                    }

                    if (!locationsList.includes(job.location)) {
                        locationsList.push(job.location);
                    }

                });
                renderJobList(jobsByDepartment);

                renderFilters(departmentList, locationsList);

                if(window.location.hash) {
                    var hash = window.location.hash.substring(1);
                    
                    $('option[value="' + hash + '"]').attr("selected", "selected").change();
                }
            }
        });

    }

    function renderJobList(jobsListByDepartment) {

        var lang = jQuery('.jobs-list-wrap').attr('data-lang');
        const jobsList = jQuery('#jobs-list');

        jobsList.html('');

        Object.keys(jobsListByDepartment).sort().forEach(function (key, index) {

            var cardKey = key;
            cardKey = cardKey.replace(/\s+/g, '-').toLowerCase();

            var toAppend = ['<div class="jobs-dept js-department-filter-target ' + cardKey + '">'];
            toAppend.push('<h2>' + key + '</h2>');
            toAppend.push('<div class="jobs-grid row">');

            jobs = this[key];

            if (jobs.length != 0) {

                Object.keys(jobs).sort().forEach(function (keyJobs) {

                    var cardLoc = [];
                    cardLoc.push(this[keyJobs].location);

                    var moreLocs = this[keyJobs].secondaryLocations;
                    moreLocs.forEach(index => {
                        cardLoc.push(index.location);
                    });

                    var displayText = cardLoc.join(', ');

                    cardLoc.forEach(index => {
                        index.replace(/\s+/g, '-').toLowerCase();
                    });

                    cardLoc = cardLoc.map(location => location.replace(/\s+/g, '-').toLowerCase());
                    var classString = cardLoc.join(' ');

                    if(lang == 'de') {
                        toAppend.push('<div class="col-6 col-md-4 d-flex job-wrap js-location-filter-target ' + classString + '"><a href="/de/karriere/jobs/job/?job=' + this[keyJobs].id + '" class="job-card">');
                    } else if(lang == 'en-us') {
                        toAppend.push('<div class="col-6 col-md-4 d-flex job-wrap js-location-filter-target ' + classString + '"><a href="/en-us/careers/jobs/job/?job=' + this[keyJobs].id + '" class="job-card">');
                    } else if(lang == 'fr') {
                        toAppend.push('<div class="col-6 col-md-4 d-flex job-wrap js-location-filter-target ' + classString + '"><a href="/fr/carrieres/jobs/job/?job=' + this[keyJobs].id + '" class="job-card">');
                    } else if(lang == 'nl') {
                        toAppend.push('<div class="col-6 col-md-4 d-flex job-wrap js-location-filter-target ' + classString + '"><a href="/nl/carriere/jobs/job/?job=' + this[keyJobs].id + '" class="job-card">');
                    } else {
                        toAppend.push('<div class="col-6 col-md-4 d-flex job-wrap js-location-filter-target ' + classString + '"><a href="/careers/jobs/job/?job=' + this[keyJobs].id + '" class="job-card">');
                    }
                    toAppend.push('<p class="title js-search-target">' + this[keyJobs].title + '</p><p class="location"><img src="/sosafe-files/themes/sosafe/img/job-location-pin.svg" loading="lazy" width="12" height="18">' + displayText + '</p>');
                    toAppend.push('</a></div>');
                }, jobs);
            } else {
                toAppend.push('<p>No Jobs were found for these criteria.</p>')
            }

            toAppend.push('</div>');

            jobsList.append(toAppend.join(""));
        }, jobsListByDepartment);
    }

    function renderFilters(departmentList, locationsList) {

        var department_filter = jQuery('.js-department-filter');
        var location_filter = jQuery('.js-location-filter');

        var toAppendLocations = [];
        var toAppendDepartments = [];

        departmentList.forEach(department => {

            var selectDept = department;
            selectDept = selectDept.replace(/\s+/g, '-').toLowerCase();

            toAppendDepartments.push('<option value="' + selectDept + '">' + department + '</option>');
        });

        department_filter.append(toAppendDepartments.join(""));

        locationsList.forEach(location => {

            var selectLoc = location;
            selectLoc = selectLoc.replace(/\s+/g, '-').toLowerCase();

            toAppendLocations.push('<option value="' + selectLoc + '">' + location + '</option>');
        });

        location_filter.append(toAppendLocations.join(""));
    }

    function hideEmptyDepts() {
        $('.js-department-filter-target').each(function(){
            
            var jobsCount = $(this).find('.job-wrap').length;
            var locationFilteredJobsCount = $(this).find('.location-filtered').length;
            var searchFilteredJobsCount = $(this).find('.search-no-match').length;

            if(jobsCount === locationFilteredJobsCount || jobsCount === searchFilteredJobsCount) {
                $(this).addClass('department-empty');
            } else {
                $(this).removeClass('department-empty');
            }
        });
    }

    function noResults() {
        // if there are no depts displayed
        var deptCount = $('.js-department-filter-target').length;
        var deptFilteredCount = $('.department-filtered').length;
        var deptEmptyCount = $('.department-empty').length;

        if( deptCount == deptFilteredCount || deptCount == deptEmptyCount ) {
            $('.no-results').addClass('show');
        } else {
            $('.no-results').removeClass('show');
        }
    }

    $('.js-department-filter').on('change', function() {
        if ($(this).val() == 'all'){
            $('.js-department-filter-target').removeClass('department-filtered');
        } else {
            var department = $(this).val();
            $('.js-department-filter-target').addClass('department-filtered');
            $('.js-department-filter-target.' + department).removeClass('department-filtered');
        }
        noResults();
    });

    $('.js-location-filter').on('change', function() {
        if ($(this).val() == 'all'){
            $('.js-location-filter-target').removeClass('location-filtered');
        } else {
            var location = $(this).val();
            $('.js-location-filter-target').addClass('location-filtered');
            $('.js-location-filter-target.' + location).removeClass('location-filtered');
        }

        hideEmptyDepts();
        noResults();
    });

    $('.js-search').on('keyup', function() {
        // Get the value from the input
        var inputValue = $(this).val().toLowerCase();

        // Loop through all paragraphs with class 'js-search-target'
        $('.js-search-target').each(function() {
            var paragraphText = $(this).text().toLowerCase();

            // Check if the input matches the paragraph text
            if (paragraphText.includes(inputValue)) {
                $(this).parents('.job-wrap').removeClass('search-no-match').addClass('search-match');
            } else {
                $(this).parents('.job-wrap').removeClass('search-match').addClass('search-no-match');
            }
        });

        hideEmptyDepts();
        noResults();
    });

});