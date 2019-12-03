// с помощью jQuery дождемся окончания загрузки документа
$(document).ready(function () {
    // Создать экземпляр Sign-In виджета Okta
    var config = window.okta.config;
    var signIn = new OktaSignIn({
      clientId: config.clientId,
      baseUrl: config.baseUrl,
      redirectUri: config.redirectUri
    });
  
    // функция для получения активной сессии, если такая есть
    function getSession() {
      return signIn.authClient.session.get()
        .then(function (session) {
          if (session.status === "ACTIVE") {
            return session.user().then(function (user) {
              return {
                session,
                user
              }
            });
          }
          return { session, user: {} };
        })
        .catch(function (err) {
          console.error("session error", err);
        });
    }
  
    function showWelcomeMessage(profile) {
      $('#okta-info .firstName').html(profile.firstName);
      $('#okta-info').show();
    }
  
    // показываем приветственное сообщение, если есть активная сессия
    getSession()
      .then(function(res) {
        if (res.session.status === 'ACTIVE') {
          showWelcomeMessage(res.user.profile);
        }
      })
      .catch(function(err){
          console.error(err);
      });
  });