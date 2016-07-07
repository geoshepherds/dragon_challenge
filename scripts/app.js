$(document).ready(function() {
    
    //detect mobile devices
    var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
    };
    
        
    ////////    load data   ////////
    
    var dcData;
    var oldRegionIndex = 7;
    
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
        
        //console.log(data);
        
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
    var scale;
    
    if (width * 10.5 >= 9700 && height >= 400) {
        scale = 9700;
    } else {
        scale = height * 14.7;
    }
    
    var projection = d3.geo.mercator()
        .center([-3.5, 52.25])
        .scale(scale)
        .translate([width / 2, height / 2]);
    
        
    var geoPath = d3.geo.path()
        .projection(projection);
   
    var mapSVG = d3.select('#map').append('svg')
        .attr({
            width: width,
            height: height
        });
    
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
    var $silver = '#4c4c4c';
    var $silverStar = '#8a8b8d';
    var $gold = '#cc9933';
    var $goldStar = '#e0bf72';
    var $platinum = '#bbbbbb';
    var $black = '#1a1a1a';
    var $white = '#fff';
    
    //gradient fill for map and barChart
    var gradientData = [
                {award: 1, color: $bronze},
                {award: 2, color: $bronzeStar},
                {award: 3, color: $silver},
                {award: 4, color: $silverStar},
                {award: 5, color: $gold},
                {award: 6, color: $goldStar},
                {award: 7, color: $platinum}        
            ]; 
    
    //append defs and linear gradient to svg's
    var metalColor = d3.selectAll('svg').append('defs').selectAll('linearGradient')
        .data(gradientData)
        .enter().append('linearGradient')
        .attr({
            id: function(d) {
                return 'gradient-' + d.award;
            },
            x1: '0%',
            x2: '20%',
            y1: '80%',
            y2: '20%'
        })
    
    //append first color stop
    metalColor.append('stop')
        .attr({
            offset: '0%',
            'stop-color': function(d) {
                return d.color;
            }
        });
    
    //append final colour stop
    metalColor.append('stop')
        .attr({
            offset: '100%',
            'stop-color': function(d) {
                return d.color;
            },
            'stop-opacity': 0.8
        });
    
    
    
  
    
    //set award class for hovered region text elements in stats
    function setAwardClass(element, award) {
        
        $(element).removeClass('bronze bronzeStar silver silverStar gold goldStar platinum');
        //console.log(element, award);
        var colClass;
        var text;
        
        if (award == 1) {
           colClass = 'bronze'; 
           text = 'Bronze'; 
        } else if (award == 2) {
            colClass = 'bronzeStar';
            text = 'Bronze Star';
        } else if (award == 3) {
            colClass = 'silver';
            text = 'Silver';
        } else if (award == 4) {
            colClass = 'silverStar';
            text = 'Silver Star';
        } else if (award == 5) {
            colClass = 'gold';
            text = 'Gold';
        } else if (award == 6) {
            colClass = 'goldStar';
            text = 'Gold Star';
        } else if (award == 7) {
            colClass = 'platinum';
            text = 'Platinum';
        }
        
        $(element).addClass(colClass);
        $(element).text(text);
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
                    return 'url(#gradient-' + d.properties.prev_award + ')';
                },
                stroke: $white,
                'stroke-width': '0.8px',
                opacity: 1
            })
            .on('mouseenter', function() {
                
                wales = false;
                
                if ($(window).width() >= 1024) {
                    
                    var hoverRegion = d3.select(this)[0][0].__data__.properties.region_nam;
                    var regionCount = d3.select(this)[0][0].__data__.properties.count;
                    var prevAward = d3.select(this)[0][0].__data__.properties.prev_award;
                    var aveAward = d3.select(this)[0][0].__data__.properties.ave_award;
                    
                    //Update $activeRegion with clicked hoverRegion
                    $activeRegion.text(hoverRegion);
                    
                    //Update .barChartTitle span with hoverRegion
                    $('.barChartTitle span').text(hoverRegion);
                    
                    //Update .statNumber with region count
                    $('h3.count').text(regionCount);
                    
                    //Update .prevAward with region prevAward
                    setAwardClass('h3.prevAward', prevAward);
                    
                    //Update .aveAward with region ave_award
                    setAwardClass('h3.aveAward', aveAward);
                    
                    //Loop through dcData to update barChart with $clickedRegion
                    for (var i = 0; i < dcData.features.length; i++) {

                        if (hoverRegion == dcData.features[i].properties.region_nam) {
                            
                            regionResults(dcData.features[i], dcData.features[oldRegionIndex]);
                            oldRegionIndex = i;

                        } else if (hoverRegion != dcData.features[i].properties.region_nam && hoverRegion != 'Wales') {

                            d3.selectAll('path#region' + dcData.features[i].properties.id)
                                .transition()
                                .duration(200)
                                .style({
                                    opacity: 0.2
                                });
                        }     
                    }
                }
                
            })
            .on('mouseleave', function() {
                
                wales = true;
                
                if ($(window).width() >= 1024) {
                    
                    //Reset $activeRegion to Wales
                    $activeRegion.text('Wales');
                    
                    //Reset .barChartTitle span to Wales
                    $('.barChartTitle span').text('Wales');
                    
                    //Update .statNumber with region count
                    $('h3.count').text(1674);
                    
                    //Update .prevAward with region prevAward
                    $('h3.prevAward').text('Bronze');
                    $('h3.prevAward').removeClass('bronze bronzeStar silver silverStar gold goldStar platinum');
                    $('h3.prevAward').addClass('bronze');
                    
                    //Update .aveAward with region ave_award
                    $('h3.aveAward').text('Silver');
                    $('h3.aveAward').removeClass('bronze bronzeStar silver silverStar gold goldStar platinum');
                    $('h3.aveAward').addClass('silver');
                    
                    //Reset opacity for all path.regions
                    d3.selectAll('path.regions')
                        .transition()
                        .duration(400)
                        .style({
                            opacity: 1
                        });
                    
                    walesResults()
                }
                
            });
        
    }   //end drawWales function
    
    
    
    
    
    ////////    barchart    ////////
    
    
    var r = $('.region').height();
    var mt = $('.mapTitle').height();
    var wm = $('.walesMap').height();
    var st = $('.statistics').height();
    var wh = $(window).height();
    
    var barChartWidth = $('#barChart').width();
    var barChartHeight;
    
    //set height of barchart depending on window width
    function getBarChartHeight() {
        if ($(window).width() >= 1024) {
            barChartHeight = wh - 438;
        } else {
            barChartHeight = wh - r - mt - wm - 30;
        }
    }
    getBarChartHeight();
    
    var barWidth = (barChartWidth - 5) / 7;
    var bar;
    var rectangle;
    var barChartScaleY = d3.scale.linear()
            .domain([-5, 55])
            .range([barChartHeight, 0]);
    var activeData;
    
    var barSVG = d3.select('#barChart').append('svg')
        .attr({
            width: barChartWidth,
            height: barChartHeight
        });
    
    var barG = d3.select('#barChart > svg').append('g')
        .attr({
            class: 'barG',
            transform: 'translate(2.5, 0)'
        });
    var bar;
    var textLabel;
    var awardLabel;
    
          
    //update barChart div with height
    $('#barChart').css({height: barChartHeight});
    
    
    //Draw default barChart results
    walesResults();
    
    
    
    
    function walesResults() {
        
        var awardResults = [
            {award: 'Bronze', percent: 29, oldpercent: 3, awardIndex: 1},
            {award: 'Bronze Star', percent: 6.8, oldpercent: 3, awardIndex: 2},
            {award: 'Silver', percent: 21.5, oldpercent: 3, awardIndex: 3},
            {award: 'Silver Star', percent: 8.5, oldpercent: 3, awardIndex: 4},
            {award: 'Gold', percent: 25.2, oldpercent: 3, awardIndex: 5},
            {award: 'Gold Star', percent: 4.8, oldpercent: 3, awardIndex: 6},
            {award: 'Platinum', percent: 4.5, oldpercent: 3, awardIndex: 7}
            ];
        
        drawBars(awardResults);
        
    }
    
    
    
    
    function regionResults(data, oldData) {
        
        
        var regionResults = [
            {award: 'Bronze', percent: +(data.properties.bronze_pct * 100).toFixed(1), oldpercent: +(oldData.properties.bronze_pct * 100).toFixed(1), awardIndex: 1},
            {award: 'Bronze Star', percent: +(data.properties.bronzestar * 100).toFixed(1), oldpercent: +(oldData.properties.bronzestar * 100).toFixed(1), awardIndex: 2},
            {award: 'Silver', percent: +(data.properties.silver_pct * 100).toFixed(1), oldpercent: +(oldData.properties.silver_pct * 100).toFixed(1), awardIndex: 3},
            {award: 'Silver Star', percent: +(data.properties.silverstar * 100).toFixed(1), oldpercent: +(oldData.properties.silverstar * 100).toFixed(1), awardIndex: 4},
            {award: 'Gold', percent: +(data.properties.gold_pct * 100).toFixed(1), oldpercent: +(oldData.properties.gold_pct * 100).toFixed(1), awardIndex: 5},
            {award: 'Gold Star', percent: +(data.properties.goldstar_p * 100).toFixed(1), oldpercent: +(oldData.properties.goldstar_p * 100).toFixed(1), awardIndex: 6},
            {award: 'Platinum', percent: +(data.properties.platinum_p * 100).toFixed(1), oldpercent: +(oldData.properties.platinum_p * 100).toFixed(1), awardIndex: 7}
            ];
        
        drawBars(regionResults);
            
    }   //end regionResults function
    
    
    //draw bars in barchart
    function drawBars(data) {
        
        barG.selectAll('g').remove();
        
        
        bar = barG.selectAll("g.awardBars")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i){
                return "translate(" + i * barWidth + ")"
            });


        //set default values for bars
        rectangle = bar.append('rect')
            .style({
                fill: function(d) {
                    return 'url(#gradient-' + d.awardIndex + ')';;
                },
                opacity: 1
                })
            .attr({
                height: function(d) { 
                    if (!isNaN(d.percent)) {
                        return barChartHeight - barChartScaleY(d.oldpercent);
                    } else {
                        return barChartHeight - 1;
                    }
                },
                width: barWidth,
                y: function(d) { 
                    if (!isNaN(d.oldpercent)) {
                        return barChartScaleY(d.oldpercent);
                    } else {
                        return 1;
                    }
                },
                class: 'rectangle'
                });
        
        
        //transition to active region data
        rectangle.transition()
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


        //append percentages as text
        textLabel = bar.append('text')
            .attr({
                x: 2,
                y: function(d) {
                    return barChartScaleY(d.percent) - 5;
                },
                dx: '0.35em',
                'text-anchor': 'start',
                class: 'percentText'
            })
            .style({
                opacity: 0
            })
            .text(function(d) {
                    return d.percent + '%';
            });

            textLabel.transition()
                .delay(800)
                .duration(200)
                .style({
                    opacity: 1
                });

        //append labels to bars
        awardLabel = bar.append('text')
                    .attr({
                        x: 3,
                        y: barChartHeight - 14,
                        dx: '0.2em',
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
                            x: 3,
                            dx: '0.2em',
                            dy: 10
                        })
                    .text('Star');
    }
    
    
    ////////    Click events    ////////
    
    //Check window size to remove overlay if desktop
    if ($(window).width() >= 1024) {
        $('.overlay').removeClass('active');
    } 
    
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
                console.log('running');
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
    
    
    //.dropDownMenu li click events & .nextRegion click events
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
                
                regionResults(dcData.features[i], dcData.features[oldRegionIndex]);
                oldRegionIndex = i;
                
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
    
    

    
    ////////     RESIZE FUNCTION    /////////
    
    $(window).resize(function() {
        
            
        //Update BarChart
        var windW = $(window).width();        
        var windH = $(window).height();
        var regH = $('.region').height();
        var mtH = $('.mapTitle').height();
        var wmH = $('.walesMap').height();
        
        barChartWidth = $('#barChart').width();
        barChartHeight;
        
        //set height of barchart depending on window width
        function getNewBarChartHeight() {
            if (windW >= 1024) {
                barChartHeight = windH - 438;
            } else {
                barChartHeight = windH - regH - mtH - wmH - 30;
            }
        }
        getNewBarChartHeight();
        
        barSVG.attr({width: barChartWidth, height: barChartHeight});
        
        barWidth = (barChartWidth - 5) / 7;
        
        //update barChart div with height
        $('#barChart').css({height: barChartHeight});
        
        
        
        barChartScaleY
            .domain([-5, 55])
            .range([barChartHeight, 0]);
        
        
        bar.attr("transform", function(d, i){
                return "translate(" + i * barWidth + ")"
            });
      
        //transition to active region data
        rectangle.attr({
                height: function(d) { 
                    if (!isNaN(d.percent)) {
                        return barChartHeight - barChartScaleY(d.percent);
                    } else {
                        return barChartHeight - 1;
                    }
                },
                width: barWidth,
                y: function(d) { 
                    if (!isNaN(d.percent)) {
                        return barChartScaleY(d.percent);
                    } else {
                        return 1;
                    }
                }
            });
        
        
        textLabel
            .attr({
                y: function(d) {
                    return barChartScaleY(d.percent) - 5;
                }
            });

        
        awardLabel.attr({y: barChartHeight - 14});
        
        
        
        
        
        //Update Map
        
        var mapW = $('#map').width();
        var mapH = $('#map').height();
        
        mapSVG.attr({width: mapW, height: mapH});
        
        if (mapW * 10.5 >= 9700 && mapH >= 400) {
            scale = 9700;
        } else {
            scale = mapH * 14.7;
        }

        
        projection
            .scale(scale)
            .translate([mapW / 2, mapH / 2]);

        
        
        d3.select('path.wales').attr('d', geoPath);
        d3.selectAll('path.regions').attr('d', geoPath);
        
        
        
        //Update display
        //update .instruction span if on mobile device and big screen
        if (isMobile.any() != null && $(window).width() >= 1024) {
            $('.selectRegion').addClass('active');
            $('.instruction').removeClass('active');
            $('.overlay').addClass('active');
            
        } else if (isMobile.any() == null && $(window).width() >= 1024) {
            $('.selectRegion').removeClass('active');
            $('.instruction').addClass('active');
            $('.overlay').removeClass('active');
            
        } else if (isMobile.any() != null && $(window).width() < 1024) {
            $('.overlay').addClass('active');
        }
        
    }); // end resize function
         
});