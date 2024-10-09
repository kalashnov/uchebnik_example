function ShortValidateLoginForm(theform)
{
	if(theform.ulogin.value==''
/*
	|| (theform.ulogin.value.search
	&& theform.ulogin.value.search(new RegExp("^[a-zA-Z][a-zA-Z0-9]+$","g"))<0)
*/
                )
	{
		alert('Пожалуйста укажите имя')
		theform.ulogin.focus()
		return false
	}
	if(theform.upassword.value=='')
	{
		alert('пожалуйста укажите пароль')
		theform.upassword.focus()
		return false
	}
	theform.Ph.value=hex_md5(theform.upassword.value)
	theform.upassword.value=''
	return true
}

function ValidateLoginForm(theform)
{
	
	if( theform.login ){
		if(theform.login.value==''
		|| (
			theform.login.value.search
			&& 
			theform.login.value.search( new RegExp("^[a-zA-Z][a-zA-Z0-9]+$","g"))<0
		   )
	    )
		{
			alert('Логин заполняется только цифрами или латинскими буквами и должен начинаться с буквы,\nиспользовать символы кирилицы, спецсимволы недопустимо.\nЭто поле должно быть заполнено.')
			theform.login.focus()
			return false
		}
	}
	
	if( theform.password ){
		if(theform.password.value!=''
		&& (theform.password.value.search
		&& theform.password.value.search(new RegExp("^[a-zA-Z0-9]+$","g"))<0)
	                )
		{
			alert('Пароль заполняется только цифрами или латинскими буквами, использовать символы кирилицы, спецсимволы недопустимо')
			theform.password.focus()
			return false
		}
	
		if(theform.password.value!=theform.password2.value){
			alert('Пароли не совпадают!')
			theform.password.focus()
			return false
		}

		if(theform.password.value==''){
			alert('Пустой пароль!')
			theform.password.focus()
			return false
		}
	}
	
	if(theform.prime_email.value==''
	|| (theform.prime_email.value.search
	&& theform.prime_email.value.search(new RegExp("^[a-zA-Z0-9\._\-]{1,50}@(([a-zA-Z0-9_\-]{1,50})(\.)){1,5}[a-zA-Z]{2,4}$","g"))<0)
                )
	{
		alert('Ошибочный электронный адрес: ' + theform.prime_email.value )
		theform.prime_email.focus()
		return false
	}

	if(theform.TLM_COMPANY.value==''){
		alert('Пожалуйста укажите название вашей компании')
		theform.TLM_COMPANY.focus()
		return false
	}

	if(theform.last_name.value==''){
		alert('Пожалуйста представьтесь')
		theform.last_name.focus()
		return false
	}
/*

	if(theform.TLM_COUNTRY.value=='' && theform.TLM_CITY.value==''){
		alert('Пожалуйста укажите откуда Вы')
		theform.TLM_COUNTRY.focus()
		return false
	}
*/	

	if(theform.phone.value==''
	|| (theform.phone.value.search
	&& theform.phone.value.search(new RegExp("^[\+\(0-9][0-9\-\)\( ]+$","g"))<0)
                )
	{
		alert('Ошибочный номер телефона: ' + theform.phone.value )
		theform.phone.focus()
		return false
	}
	return true
}

function DocumentLoad()
{
		document.memberLogin.ulogin.focus()
		document.memberLogin.ulogin.select()
}

function SetRegformFocusByName(theName){
	for(i=0 ; i<document.AFMain.elements.length ; i++){
		if ( document.AFMain.elements[i].name == theName ){
			document.AFMain.elements[i].focus();
			return true;
		}
	}
	return true;
}
