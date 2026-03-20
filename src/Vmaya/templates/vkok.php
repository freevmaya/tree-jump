<!DOCTYPE html>
<html lang="ru" data-bs-theme="<?=isset(Page::$request['theme']) ? Page::$request['theme'] : 'dark' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <?include('noindex.php')?>
    <title><?=Lang('app_name');?></title>
  
	<!-- Bootstrap CSS -->
	<link href="<?=BASEURL?>/styles/bootstrap.min.css" rel="stylesheet">
	<!-- Bootstrap Icons -->
	<link rel="stylesheet" href="<?=BASEURL?>/styles/bootstrap-icons.css">
	<!-- Custom CSS -->
	<link rel="stylesheet" href="<?=BASEURL?>/styles/main.css?v=<?=$v?>">
	<link rel="stylesheet" href="<?=BASEURL?>/styles/dialog.css?v=<?=$v?>">
    <script>var DEV = <?=$is_developer ? 'true' : 'false'?></script>
	<?include('tracker.php')?>

	<script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>
	<script src="<?=SCRIPTURL?>jquery-4.0.0.min.js"></script>
	<script src="<?=SCRIPTURL?>vkapp.js<?=$v?>" defer></script>

	<?include('lang_script.php')?>
	<script>
		let VK_GROUP_ID = <?=VK_GROUP_ID?>;
		vkBridge.send("VKWebAppInit", {})
			.then((response)=>{
				tracer.log(response);
			});


		vkBridge.send('VKWebAppGetConfig', {})
			.then(((data) => { 
				if (data && data.appearance) {
		            tracer.log('Тема VK:', data.appearance);
		            document.documentElement.setAttribute('data-bs-theme', data.appearance);
		        }
			}).bind(this));

		var user_id = <?=$user_id?>;
		var vkApp;
		<?if ($new_user) {?>
		var new_user = true;
		<?}?>
		$(window).ready(()=>{
			vkApp = new VKApp(<?=VK_APP_ID?>, <?=$source_user_id?>, '<?=$source?>');
		});
	</script>
</head>
<body class="theme vkok">
	<?=$content?>
</body>
</html>