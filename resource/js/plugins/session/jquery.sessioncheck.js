function resetandlogout()
{
    $.session.clear();
    $.session.set('msg_session','Your session has expired please log in again')
    window.location.href = "login.html";
}

if($.session.get("access_token")==undefined || $.session.get("access_token")=='')
{
    resetandlogout();
}