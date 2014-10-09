var request = require('request'),
	cheerio = require('cheerio'),
	cookieJar = request.jar(),
	argv = require('minimist')(process.argv.slice(2));

	request = request.defaults({jar: cookieJar});
	
var searchUrl = 'https://secure.sos.state.or.us/orestar/GotoSearchByName.do',
	postUrl = 'https://secure.sos.state.or.us/orestar/CommitteeSearchFirstPage.do',
	redirectUrl = 'https://secure.sos.state.or.us/orestar/displayFiler.do',
	searchOptions = {
		buttonName: '',
		page:1,
		committeeName:'',
		committeeNameMultiboxText:'contains',
		committeeId:argv['_'][0],
		firstName:'',
		firstNameMultiboxText:'contains',
		lastName:'',
		lastNameMultiboxText:'contains',
		submit:'Submit',
		discontinuedSOO:'false',
		approvedSOO:'true',
		pendingApprovalSOO:'false',
		insufficientSOO:'false',
		resolvedSOO:'false',
		rejectedSOO:'false'
	};

var tableNames = [];


var idInfo = {};
	request(searchUrl, function() {
		
		request.post(postUrl, {form: searchOptions}, function(err, resp, body) {
			
			if(resp.statusCode == 302){
				request(redirectUrl, function(err, resp, body){
					var $ = cheerio.load(body);
					var pat = /\w+/;
					$("h5").each(function(){
						tableNames.push($(this).text());

					});
					$("h5").first().nextAll('div').each(function(){
							$(this).children().each(function(){
								if($(this).hasClass('boldText') && (pat.test($(this).text())|| pat.test($(this).next().text()))){
									console.log($(this).text().trim() + " " + $(this).next().text().trim());
								};
							});
						});
				});
			} else {




			var $ = cheerio.load(body),
				table;

				if($('form').attr()){

					$('table h5').each(function(i, elem){
					//console.log(elem.children[0].data);
					tableNames.push(elem.children[0].data);
					});


				tableNames.forEach(function(name) {
					table = $('h5:contains(' + name + ')').eq(0).closest('table');
					idInfo[name] = {};
					
					if (name.indexOf("opposes") != -1){
						
						var array = [];

						table.find("tr").each(function(){
							
							if ($(this).children().length == 1 || $(this).find('td').first().hasClass('backgound-ash')){
								//do nothing
							} else {

								
								var object = {};

								$(this).find('td').each(function(index){
								
									if (index == 0){
									object.election = $(this).text();
									} else if (index == 1){
										object.support = $(this).text();
									} else {
										object.details = $(this).text();
									}
							
								});
							
							array.push(object);
						}
							
							});

						idInfo[name]["measures"] = JSON.stringify(array);
					
					} else {


					table.find('td.label').each(function() {
						var label = $(this).text();
						var value = $(this).next().text();
						idInfo[name][label] = value;
					});
				
					}

				});


				} 

				}

			//console.log(idInfo);
		})
	});


