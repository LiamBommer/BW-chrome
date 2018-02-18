$(document).ready(function() {

	// 模态框初始化
	$('#signup-modal').modal();
	$('#login-modal').modal();
	$('#info-modal').modal();
	$('#pw-modal').modal();
	$('#new-entry-modal').modal();
	$('#new-inte-modal').modal();

	// 本机测试用服务器
	var server_url = 'http://127.0.0.1/BuzzwordReader/';
	// 生产环境公网服务器
	// var server_url = 'http://119.29.58.165:81/index.php/';


	// 显示登录用户
	chrome.storage.sync.get({
		BW_username: 'unknown',
		BW_userId: -1
	},
	 function(items) {
		 $('#username-div').html(items.BW_username);
		 $('#userId-div').html(items.BW_userId);
	});


	/*
	 * 注册提交按钮事件
	 * 功能:
	 * 	先进行输入合法性检验，然后用ajax进行提交
	 * 	成功后关闭模态框
	 * 	失败时在console中输出结果
	 * 待完成功能：
	 *	输入合法性检验
	 *	鼠标离开后，检查用户名等是否已经存在
	 *	提交时再次进行检查
	 *	完成后的动作
	 */
	$('#signup-btn').click(function() {

		// 输入合法性检验
		var username = $('#username').val();
		var password = $('#password').val();
		var email = $('#email').val();
		var phone = $('#phone').val();
		var gender = $('#gender').val();
		var profile = $('#profile').val();
		if(gender != 'male' || gender != 'female') {
			alert('性别问题');
		}else if(gender == 'male') {
			gender = 0;
		}else {
			gender = 1;
		}

		// ajax 传输
		$.ajax({
			type:'POST',
			url: server_url + 'User/signup',
			timeout: 5000,
			// 同步进行
			async: false,
			dataType: 'json',
			data: {
				username: username,
				password: password,
				email: email,
				phone: phone,
				gender: gender,
				profile: profile
			},
			success: function(result) {
				if(result.result == 'success') {
					// $('.modal-content > h4').html('注册成功');
					console.log(JSON.stringify(result));
					$('#signup-modal').modal('close');
				}
				if(result.result == 'failure') {
					// $('.modal-content > h4').html('注册失败');
					alert('注册失败!\n' + result.error_msg);
				}
			},
			error: function(error) {
				alert('注册错误，请重试');
				console.log(JSON.stringify(error));
				$('#signup-modal').html(error.responseText);
				return;
			},
			scriptCharset: 'utf-8'
		});

		// 阻止表单提交
		return false;
	});


	/*
	 * 登录提交按钮事件
	 * 功能:
	 *	输入邮箱、电话、用户名任一个进行登录
	 *	登录成功后，服务器存用户session，插件storage存用户名
	 *
	 * 待完成功能：
	 *	鼠标离开后，进行检验
	 */
	$('#login-btn').click(function() {

		// 输入合法性检验
		var email = $('#email-login').val();
		var phone = $('#phone-login').val();
		var password = $('#password-login').val();

		if(email == null && phone == null) {
			alert('请填写邮箱或手机号');
			return;
		}

		// ajax 传输
		$.ajax({
			type:'POST',
			url: server_url + 'User/login',
			timeout: 5000,
			async: true,
			dataType: 'json',
			data: {
				email: email,
				phone: phone,
				password: password
			},
			success: function(result) {
				if(result.result == 'success') {
					console.log(JSON.stringify(result));
					// 关闭模态框，清空内容
					$('#login-modal').modal('close');
					$('#email-login').val('');
					$('#phone-login').val('');
					$('#password-login').val('');

					// 将用户名，用户Id存入storage
					chrome.storage.sync.set({
						BW_username: result.row.username,
						BW_userId: result.row.id_user
					},function() {
						// 更新登录用户
						chrome.storage.sync.get({
							// 取值： 默认值
							BW_username: 'unknown',
							BW_userId: -1
						},
						 function(items) {
							 $('#username-div').html(items.BW_username);
							 $('#userId-div').html(items.BW_userId);
						});
					});
				}
				if(result.result == 'failure') {
					// $('.modal-content > h4').html('注册失败');
					alert('登录失败!\n' + result.error_msg);
				}
			},
			error: function(error) {
				alert('登录错误，请重试');
				console.log(JSON.stringify(error));
				$('#login-modal').html(error.responseText);
				return;
			},
			scriptCharset: 'utf-8'
		});

		// 阻止表单提交
		return false;

	});


	/*
	 * 个人信息显示按钮
	 * 功能:
	 *	打开模态框，用ajax请求数据并显示
	 *
	 * 待完成功能：
	 *
	 */
	$('#info-btn').click(function() {

		$('#info-modal').modal('open');

		// 从存储中获取用户名
		chrome.storage.sync.get({
			BW_username: 'unknown'
		}, function(items) {
			var username = items.BW_username;
			// $('#info-collec-ul').append("<li class='collection-item'>"+username+"</li>");
			if(!username) {
				alert('username from storage didnt get'+username);
			}

			// ajax 传输
			// 根据用户名获取用户信息
			$.ajax({
				type:'GET',
				url: server_url + 'User/getInfo',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					username: username
				},
				success: function(result) {
					if(result.result == 'success') {
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.email+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.phone+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.identity+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.gender+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.profile+"</li>");
					}
					if(result.result == 'failure') {
						alert('获取信息失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('错误，请重试');
					console.log(JSON.stringify(error));
					$('#info-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

	});


	/*
	 * 修改密码按钮
	 * 功能:
	 *	打开模态框，
	 *	确认旧密码正确性
	 *	确认新密码有效性，发送ajax请求修改
	 *
	 * 待完成功能：
	 *	密码格式检验
	 */
	$('#pw-btn').click(function() {

		// 从存储中获取用户名
		chrome.storage.sync.get({
			BW_username: 'not set'
		}, function(items) {
			var username = items.BW_username;
			if(!username) {
				alert('username from storage didnt get'+username);
				return;
			}

			var pw_origin = $('#password-origin').val();
			var pw_new_1 = $('#password-new-1').val();
			var pw_new_2 = $('#password-new-2').val();

			// validate
			if(pw_origin==null || pw_new_1==null || pw_new_2==null) {
				alert('不能有空');
				return;
			}
			if(pw_origin == pw_new_1) {
				alert('新旧密码不能一样');
				return;
			}
			if(pw_new_1 != pw_new_2) {
				alert('两次密码输入不同！');
				return;
			}
			// if() {
			// 	// 验证密码有效性
			// }

			$.ajax({
				type:'POST',
				url: server_url + 'User/pwEdit',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					username: username,
					pw_origin: pw_origin,
					pw_new_1: pw_new_1,
					pw_new_2:	pw_new_2
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						// 关闭模态框，清空内容
						$('#pw-modal').modal('close');
						$('#password-origin').val('');
						$('#password-new-1').val('');
						$('#password-new-2').val('');
					}
					if(result.result == 'failure') {
						alert('密码重置失败!\n' + result.error_msg);
						$('#password-new-1').val('');
						$('#password-new-2').val('');
					}
				},
				error: function(error) {
					alert('密码重置错误，请重试');
					console.log(JSON.stringify(error));
					$('#pw-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

	});


	/*
	 * 搜索框提交事件
	 * 功能：
	 *  根据输入的关键词搜索
	 *  并输出相关词条
	 *
	 * 待完成功能：
	 *
	 */
	 document.getElementById('search-field').onsearch=function() {

		 // 清空结果
		 $('#search-result-div').html('');

		 var search_content = $('#search-field').val();

			$.ajax({
				type:'GET',
				url: server_url + 'Entry/search/',
				timeout: 3000,
				async: true,
				dataType: 'json',
				data: {
					search_content: search_content
				},
				success: function(result) {
					console.log(JSON.stringify(result));
					if(result.result == 'empty') {
						$('#search-result-div').append("<br/><h6>没有相关结果</h6>");
						return;
					}
					for(i in result.entry) {
						var html = "<div class='col l4 m6 s12'>" +
								"<div class='card z-depth-2'>" +
									"<div class='card-content'>" +
										"<span class='card-title'>"+result.entry[i].name+"</span>" +
										"<p>id: "+result.entry[i].id_entry+"</p>" +
										"<p>是否已开放: "+result.entry[i].is_open+"</p>" +
										"<p>请求次数: "+result.entry[i].request+"</p>" +
										"<p>创建时间: "+result.entry[i].datetime+"</p>" +
										"<br><div class='divider'></div><br>" +
										"<span class='card-title'>Interpretation</span>";
						for(j in result.inte) {
							// 根据词条id选取词条下的释义
							if(result.inte[j].id_entry == result.entry[i].id_entry) {
								html += "<p>id_interpretation: "+result.inte[j].id_interpretation+"</p>" +
										"<p>id_entry: "+result.inte[j].id_entry+"</p>" +
										"<p>id_user: "+result.inte[j].id_user+"</p>" +
										"<p>释义: "+result.inte[j].interpretation+"</p>" +
										"<p>来源: "+result.inte[j].resource+"</p>" +
										"<p>创建时间: "+result.inte[j].datetime+"</p>"
										"<br/><br/>";
							}
						}
						html += "</div>" +
								"</div>" +
							"</div>";
						$('#search-result-div').append(html);
					}
				},
				error: function(error) {
					alert('查询请求错误，请重试');
					console.log(JSON.stringify(error));
					// error display
					$('#search-result-div').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

	 };


	/*
	 * 创建词条
	 * 功能：
	 *  根据名字创建词条
	 *	请求次数为1
	 *
	 * 待完成功能：
	 *
	 */
	$('#new-entry-btn').click(function() {

			var entry_name = $('#entry-name').val();

			$.ajax({
				type:'GET',
				url: server_url + 'Entry/create',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					entry_name: entry_name
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('词条创建成功！\n可进行查询')
						$('#new-entry-modal').modal('close');
					}
					if(result.result == 'failure') {
						alert('创建词条失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('创建时ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#new-entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});


	/*
	 * 为词条添加释义
	 * 功能：
	 *  确定词条id，提取用户id
	 *	填写释义和来源（可选）并提交
	 *
	 * 待完成功能：
	 *	词条id由点击词条时自动获取
	 *
	 */
	$('#new-inte-btn').click(function() {

			var id_entry = $('#id-entry').val();
			var inte = $('#inte').val();
			var resource = $('#resource').val();
			var id_user = -1;
			// 获取当前登录用户id
			/*
			 * !!! IMPORTANT !!!
			 *
			 * chrome storage 事件为同步，故总是在其他异步代码(js一般都是)后执行
			 * 故在callback函数外下一步取id_user时失败
			 *
			 * solution:
			 *	将涉及到取得的值的操作，都放在callback函数里操作
			 *
			 * refer:
			 *	https://stackoverflow.com/questions/12252817/how-chrome-storage-local-get-sets-a-value
			 */
			chrome.storage.sync.get({
				BW_userId: -1
			},
			 function(items) {
				 id_user = items.BW_userId;
					// validate
					if(id_entry == null || inte == null) {
						alert('Entry Id & intepretation are required!');
						return;
					}
					if(id_user == -1) {
						alert('Cannot get correct user ID.')
						return;
					}

					$.ajax({
						type:'POST',
						url: server_url + 'Entry/insert_inte/',
						timeout: 5000,
						async: true,
						dataType: 'json',
						data: {
							id_entry: id_entry,
							id_user: id_user,
							inte: inte,
							resource: resource
						},
						success: function(result) {
							if(result.result == 'success') {
								console.log(JSON.stringify(result));
								alert('添加释义成功！')
								$('#new-inte-modal').modal('close');
							}
							if(result.result == 'failure') {
								alert('添加释义失败!\n' + result.error_msg);
							}
						},
						error: function(error) {
							alert('ajax错误，请重试');
							console.log(JSON.stringify(error));
							$('#new-inte-modal').html(error.responseText);
							return;
						},
						scriptCharset: 'utf-8'
					});

			});

					//阻止表单提交
					return false;

		});


});
