$(document).ready(function() {
        
    ////////    load data   ////////
    
    var dcData;
    
    //queue data
    queue()
        .defer(d3.json, 'data/dc_data.geojson')
        .defer(d3.json, 'data/wales_outline.geojson')
        .await(pushData);
    
    
    
    //load data
    function pushData(error, data, wales) {

        if (error) throw error;
        
        //update global variable to store data
        dcData = data;
        
        drawWales(wales);
        drawRegions(data);
        
        console.log(data);
        
    };
    
    
    
    
    ////////    map     ////////
    
    
    var width = $('#map').width();
    var height = $('#map').height();
    var margin = {
        top: 20,
        right: 20,
        left: 20,
        bottom: 20
    };
    
    var projection = d3.geo.mercator()
        .center([-3.5, 52.25])
        .scale(width * 10.5)
        .translate([width / 2, height / 2]);
    
        
    var geoPath = d3.geo.path()
        .projection(projection);
   
    
    var mapG = d3.select('#map > svg').append('g')
        .attr({
            class: 'mapG',
            transform: 'translate(' + margin.left + ',' + margin.top + ')'
        });
    
    
    //color variables
    var $aubergine = '#b2a0a0';
    var $aubergineDark = '#6b5e5e';
    var $aubergineLight = '#dfd9d9';
    var $bronze = '#b06442';
    var $bronzeStar = '#d0825e';
    var $silver = '#636060';
    var $silverStar = '#8a8b8d';
    var $gold = '#cc9933';
    var $goldStar = '#e0bf72';
    var $platinum = '#bbbbbb';
    var $black = '#1a1a1a';
    var $white = '#fff';
    
    
    
    function getColor(award) {
        
        if ($.type(award) == 'string') {
            
            return award === null ? $black :
            award == 'Bronze' ? $bronze :
            award == 'Bronze Star' ? $bronzeStar :
            award == 'Silver' ? $silver :
            award == 'Silver Star' ? $silverStar :
            award == 'Gold' ? $gold :
            award == 'Gold Star' ? $goldStar :
            award == 'Platinum' ? $platinum :
                        $black;
        } else {
            
            return award === null ? $black :
            award == 1 ? $bronze :
            award == 2 ? $bronzeStar :
            award == 3 ? $silver :
            award == 4 ? $silverStar :
            award == 5 ? $gold :
            award == 6 ? $goldStar :
            award == 7 ? $platinum :
                        $black;
        }
        
    }
    
    
    
    //draw wales outline
    function drawWales(geoShape) {
        
        var walesPath = mapG.selectAll('path.wales')
            .data(geoShape.features)
            .enter().append('path')
            .attr({
                d: geoPath,
                class: 'wales'
            })
            .style({
                fill: 'none',
                stroke: $aubergineLight,
                'stroke-width': '1px',
                opacity: 1
            });
        
    }   //end drawWales function
    
    
    //draw wales outline
    function drawRegions(geoShape) {
        var regionsPath = mapG.selectAll('path.regions')
            .data(geoShape.features)
            .enter().append('path')
            .attr({
                d: geoPath,
                class: 'regions',
                id: function(d) {
                    return 'region' + d.properties.id;
                }
            })
            .style({
                fill: function(d) {
                    return getColor(d.properties.prev_award);
                },
                stroke: $white,
                'stroke-width': '0.8px',
                opacity: 1
            });
        
    }   //end drawWales function
    
    
    
    ////////    barchart    ////////
    
    
    var r = $('.region').height();
    var mt = $('.mapTitle').height();
    var wm = $('.walesMap').height();
    var st = $('.statistics').height();
    var wh = $(window).height();
    
    
    var barChartWidth = $('#barChart').width();
    var barChartHeight = wh - r - mt - wm - 30;
    var barWidth = (barChartWidth - 5) / 7;
    var bar;
    var rectangle;
    var barChartScaleY = d3.scale.linear()
            .domain([-5, 55])
            .range([barChartHeight, 0]);
    var barYAxis;
    
    var barG = d3.select('#barChart > svg').append('g')
        .attr({
            class: 'barG',
            transform: 'translate(2.5,0)'
        });
    
    barYAxis = d3.svg.axis()
            .scale(barChartScaleY);
    
    
    //update barChart div with height
    $('#barChart').css({height: barChartHeight});
    
    
    //Draw default barChart results
    walesResults();
    
    
    
    
    function walesResults() {
        
        var awardResults = [
            {award: 'Bronze', percent: 29},
            {award: 'Bronze Star', percent: 6.8},
            {award: 'Silver', percent: 21.5},
            {award: 'Silver Star', percent: 8.5},
            {award: 'Gold', percent: 25.2},
            {award: 'Gold Star', percent: 4.8},
            {award: 'Platinum', percent: 4.5}
            ];

        barG.selectAll('g').remove();
        
        bar = barG.selectAll("g.awardBars")
            .data(awardResults)
            .enter().append("g")
            .attr("transform", function(d, i){
                    return "translate(" + i * barWidth + ")"
                });

       
            rectangle = bar.append('rect')
                .style({
                    fill: function(d) {
                        return getColor(d.award);
                    },
                    opacity: 1
                    })
                .attr({
                    height: barChartScaleY(1),
                    width: barWidth,
                    y: barChartScaleY(1),
                    class: 'rectangle'
                    });

            rectangle.transition()
                .delay(800)
                .duration(800)
                .ease("quad")
                .attr({
                    height: function(d) { 
                        if (!isNaN(d.percent)) {
                            return barChartHeight - barChartScaleY(d.percent);
                        } else {
                            return barChartHeight - 1;
                        }
                    },
                    y: function(d) { 
                        if (!isNaN(d.percent)) {
                            return barChartScaleY(d.percent);
                        } else {
                            return 1;
                        }
                    },
                    class: 'rectangle'
                });
                

            var textLabel = bar.append('text')
                .attr({
                    x: 2,
                    y: function(d) {
                        return barChartScaleY(d.percent) - 5;
                    },
                    dx: '0.35em',
                    'text-anchor': 'start',
                    class: 'percentText'
                })
                .text(function(d) {
                    return d.percent + '%';
            });

        
            var awardLabel = bar.append('text')
                    .attr({
                        x: 2,
                        y: barChartHeight - 14,
                        dx: '0.35em',
                        'text-anchor': 'start',
                        class: 'awardText',
                        id: function(d) {
                            if (d.award == 'Bronze' || d.award == 'Silver' || d.award == 'Gold' || d.award == 'Platinum') {
                                return 'noStar';
                            } else {
                                return 'star';
                            }
                        }
                    })
                    .text(function(d) {
                        if (d.award == 'Bronze' || d.award == 'Silver' || d.award == 'Gold' || d.award == 'Platinum') {
                           return d.award; 
                        } else {
                            var length = d.award.length - 5;
                            return d.award.slice(0,length);
                        }
                        
                    });
        
                    d3.selectAll('text#star').append('tspan')
                        .attr({
                            x: 2,
                            dx: '0.35em',
                            dy: 10
                        })
                    .text('Star');
        
    }
    
    
    
    
    function regionResults(data) {
        
        var awardResults = [
            {award: 'Bronze', percent: +(data.properties.bronze_pct * 100).toFixed(1)},
            {award: 'Bronze Star', percent: +(data.properties.bronzestar * 100).toFixed(1)},
            {award: 'Silver', percent: +(data.properties.silver_pct * 100).toFixed(1)},
            {award: 'Silver Star', percent: +(data.properties.silverstar * 100).toFixed(1)},
            {award: 'Gold', percent: +(data.properties.gold_pct * 100).toFixed(1)},
            {award: 'Gold Star', percent: +(data.properties.goldstar_p * 100).toFixed(1)},
            {award: 'Platinum', percent: +(data.properties.platinum_p * 100).toFixed(1)}
            ];
        
        barG.selectAll('g').remove();
        
        bar = barG.selectAll("g.awardBars")
            .data(awardResults)
            .enter().append("g")
            .attr("transform", function(d, i){
                    return "translate(" + i * barWidth + ")"
                });

       
            rectangle = bar.append('rect')
                .style({
                    fill: function(d) {
                        return getColor(d.award);
                    },
                    opacity: 1
                    })
                .attr({
                    height: barChartScaleY(1),
                    width: barWidth,
                    y: barChartScaleY(1),
                    class: 'rectangle'
                    });

            rectangle.transition()
                .delay(800)
                .duration(800)
                .ease("quad")
                .attr({
                    height: function(d) { 
                        if (!isNaN(d.percent)) {
                            return barChartHeight - barChartScaleY(d.percent);
                        } else {
                            return barChartHeight - 1;
                        }
                    },
                    y: function(d) { 
                        if (!isNaN(d.percent)) {
                            return barChartScaleY(d.percent);
                        } else {
                            return 1;
                        }
                    },
                    class: 'rectangle'
                });
                

            var textLabel = bar.append('text')
                .attr({
                    x: 2,
                    y: function(d) {
                        return barChartScaleY(d.percent) - 5;
                    },
                    dx: '0.35em',
                    'text-anchor': 'start',
                    class: 'percentText'
                })
                .text(function(d) {
                    return d.percent + '%';
                });
        
        
            var awardLabel = bar.append('text')
                        .attr({
                            x: 2,
                            y: barChartHeight - 14,
                            dx: '0.35em',
                            'text-anchor': 'start',
                            class: 'awardText',
                            id: function(d) {
                                if (d.award == 'Bronze' || d.award == 'Silver' || d.award == 'Gold' || d.award == 'Platinum') {
                                    return 'noStar';
                                } else {
                                    return 'star';
                                }
                            }
                        })
                        .text(function(d) {
                            if (d.award == 'Bronze' || d.award == 'Silver' || d.award == 'Gold' || d.award == 'Platinum') {
                               return d.award; 
                            } else {
                                var length = d.award.length - 5;
                                return d.award.slice(0,length);
                            }

                        });

                        d3.selectAll('text#star').append('tspan')
                            .attr({
                                x: 2,
                                dx: '0.35em',
                                dy: 10
                            })
                        .text('Star');

            
    }   //end regionResults function
    
    
    
    
    ////////    Click events    ////////
    
    //Close .overlay on .gotItBtn click
    $('.gotItBtn').on('click', function() {
        $('.overlay').removeClass('active'); 
    }); // end .gotItBtn click event
    
    
    //.selectRegion click event
    $('.selectRegion').on('click', function() {
        
        //Ensure that .overlay does NOT have class .active
        if (!$('.overlay').hasClass('active')) {
            
            //Check if dropdownmenu is active
            if ($('.dropDownMenu').hasClass('active')) {
                
                //Remove active class from .dropDownMenu
                $('.dropDownMenu').removeClass('active'); 

                //Update dropdown button icon to dropdown button
                $('.regionBtn > img').attr('src', 'media/icons/dropDown.svg').css({width: '17px', height: '9px'});

                //Show .readMore button 
                $('.readMore').addClass('active');


            } else {
                 //add active class to .dropDownMenu
                $('.dropDownMenu').addClass('active'); 

                //Update dropdown button icon to close button
                $('.regionBtn > img').attr('src', 'media/icons/closeDark.svg').css({width: '14px', height: '14px'});

                //Hide .readMore button 
                $('.readMore').removeClass('active');
            }
            
        }
    }); //end selectRegion click event
    
    
    //.readMore click event 
    $('.readMore').on('click', function() {
        
        //Ensure that .overlay does NOT have class .active
        if (!$('.overlay').hasClass('active')) {
            
            //Check if window width is less than 1024px
            if ($(window).width() < 1024) {
            
                //Remove .active class from .mainView
                $('.mainView').removeClass('active');

                //Add .active class to .infoView
                $('.infoView').addClass('active'); 

                //Hide .readMore button 
                $('.readMore').removeClass('active');

                //Hide .selectRegion button
                $('.selectRegion').removeClass('active');
                
            } else {
                
                //Add .active class to .infoView
                $('.infoView').addClass('active'); 
                
                //Hide .readMore button 
                $('.readMore').removeClass('active');
                
            }
        }
        
    }); // end .readMore click event
    
    
    //#closeBtn click event 
    $('#closeBtn').on('click', function() {
        
        //Check if window width is less than 1024px
        if ($(window).width() < 1024) {
            
            //Remove .active class to .infoView
            $('.infoView').removeClass('active'); 

            //Add .active class from .mainView
            $('.mainView').addClass('active');

            //Show .readMore button 
            $('.readMore').addClass('active');

            //Show .selectRegion button
            $('.selectRegion').addClass('active');
            
        } else {
            
            //Remove .active class to .infoView
            $('.infoView').removeClass('active');
            
            //Show .readMore button 
            $('.readMore').addClass('active');
            
        }
        
        
    }); //end .closeBtn click event
    
    
    //.dropDownMenu li click events
    var $dropDownList = $('.dropDownMenu > ol');
    var $region = $('.dropDownMenu > ol > li');
    var $activeRegion = $('.region > h4');
    var $availableRegions = ['Bridgend', 'Caerphilly', 'Cardiff', 'Carmarthenshire', 'Conwy', 'Isle of Anglesey', 'Merthyr Tydfil', 'Monmouthshire', 'Newport', 'Pembrokeshire', 'Swansea', 'Torfaen', 'Wrexham'];
    
    $region.on('click', dropDownClick);
               
    
    function dropDownClick() {
        
        var $clickedRegion = $(this).children().text();
        var $clickedRegionIndex = $.inArray($clickedRegion, $availableRegions);
        var $currentRegion = $activeRegion.text();
        var $li = '';
        
        //Remove $clickedRegion from $availableRegions
        $availableRegions.splice($clickedRegionIndex, 1);
        
        //Insert $activeRegion into $availableRegions and sort alphabetically
        $availableRegions.push($currentRegion);
        $availableRegions.sort();     
        
        //Update $activeRegion with clicked $region
        $activeRegion.text($clickedRegion);
        
        //Update .barChartTitle span with $clickedRegion
        $('.barChartTitle span').text($clickedRegion);
        
        //Loop through $availableRegions and update $dropDownList 
        for (var i = 0; i < $availableRegions.length; i++) {
        
            $li += '<li><h6 class="light">' + $availableRegions[i] + '</h6></li>';
            
            $dropDownList.html($li);        
        }
        
        //bind click event to new list items
        $('.dropDownMenu > ol > li').on('click', dropDownClick);
        
        //Reset opacity for all path.regions
        d3.selectAll('path.regions')
            .style({
                opacity: 1
            });
        
        //Loop through dcData to update barChart with $clickedRegion
        for (var i = 0; i < dcData.features.length; i++) {
            
            if ($clickedRegion == dcData.features[i].properties.region_nam) {
                
                regionResults(dcData.features[i]);
                
            } else if ($clickedRegion == 'Wales') {
                
                walesResults();
            } else if ($clickedRegion != dcData.features[i].properties.region_nam && $clickedRegion != 'Wales') {
                
                d3.selectAll('path#region' + dcData.features[i].properties.id)
                    .style({
                        opacity: 0.2
                    });
            }     
        }
        
        //Remove active class from .dropDownMenu
        $('.dropDownMenu').removeClass('active'); 

        //Update dropdown button icon to dropdown button
        $('.regionBtn > img').attr('src', 'media/icons/dropDown.svg').css({width: '17px', height: '9px'});

        //Show .readMore button 
        $('.readMore').addClass('active');
        
    }   //end dropDownClick function
    
    
    
    
    
         
});