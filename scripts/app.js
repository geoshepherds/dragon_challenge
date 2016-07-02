$(document).ready(function() {
        
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
    var $availableRegions = ['Brigend', 'Caerphilly', 'Cardiff', 'Carmarthenshire', 'Conwy', 'Isle of Anglesey', 'Merthyr Tydfil', 'Monmouthshire', 'Newport', 'Pembrokeshire', 'Swansea', 'Torfaen', 'Wrexham'];
    
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
        
    }   //end dropDownClick function
    
    
    
    
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
        
        dcData = data;
        
        drawWales(wales);
        drawRegions(dcData);
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
    
    
    
    function regionColor(award) {
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
                class: 'regions'
            })
            .style({
                fill: function(d, i) {
                    return regionColor(d.properties.prev_award);
                },
                stroke: $white,
                'stroke-width': '0.8px',
                opacity: 1
            });
        
    }   //end drawWales function
         
});