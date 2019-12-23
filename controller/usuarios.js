app.controller('usuarios', function($scope, dao, pager, alert, utils) {
    var vm = this;
    var db = {};
  
    vm.initUsuarios = function() {
      db.usuarios = new Datastore({ filename: 'db/usuarios.db', autoload: true});
      vm.findUsuarios();
    };
  
    vm.setPage = function(page) {
      vm.pager = pager.getPager(vm.usuarios.length, page);
      vm.items = vm.usuarios;
      if (vm.pager.totalItems == 0) {
        return;
      }
      vm.items = vm.usuarios.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };
  
    vm.newPassword = function(password) {
      return {
        original: password,
        confirmation: password
      }
    };
  
    vm.createUsuario = function(login) {
      vm.usuario = new Object();
      vm.usuario.login = login;
      vm.password = vm.newPassword()
      vm.validatePassword(vm.password);
    };
  
    vm.saveUsuario = function(usuario) {
      usuario.loginSearch = utils.normalize(usuario.login);
      usuario.nomeSearch = utils.normalize(usuario.nome);
      usuario.password = utils.encrypt(vm.password.original);
      if (usuario._id) {
        vm.updateUsuario(usuario);
      } else {
        vm.insertUsuario(usuario);
      }
    };
  
    vm.insertUsuario = function(usuario) {
      var promise = dao.insert(db.usuarios, usuario);
      promise.then(function(doc) {
        vm.usuario = null;
        vm.findUsuarios();
        alert.success("Usuário cadastrado.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar cadastrar o usuário. (" + err + ")");
      });
    };
  
    vm.updateUsuario = function(usuario) {
      var promise = dao.update(db.usuarios, {_id: usuario._id}, usuario, false);
      promise.then(function(doc) {
        if (USER._id == doc._id) {
          USER = doc;
        }
        vm.usuario = null;
        vm.findUsuarios();
        alert.success("Usuário atualizado.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar atualizar o usuário. (" + err + ")");
      });
    };
  
    vm.findUsuarios = function() {
      if (utils.isAdmin()) {
        var promise = dao.find(db.usuarios, {"level": {$gt: "0"}}, {loginSearch: 1});
        promise.then(function(docs) {
          vm.usuarios = docs;
          vm.setPage(1);
        }, function(err) {
          console.log(err);
          alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
        });
      } else {
        var promise = dao.find(db.usuarios, {"_id": USER._id}, {});
        promise.then(function(docs) {
          vm.usuarios = docs;
          vm.setPage(1);
        }, function(err) {
          console.log(err);
          alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
        });
      }
    };
  
    vm.findUsuariosByLogin = function(login) {
      var promise = dao.find(db.usuarios, {loginSearch: utils.newRegExp(login), "level": {$gt: "0"}}, {loginSearch: 1});
      promise.then(function(docs) {
        vm.usuarios = docs;
        vm.setPage(1);
        vm.query = '';
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
      });
    };
  
    vm.findUsuarioById = function(id) {
      var promise = dao.findOne(db.usuarios, {_id: id});
      promise.then(function(doc) {
        vm.usuario = doc;
        vm.password = vm.newPassword(utils.decrypt(vm.usuario.password));
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o usuário. (" + err + ")");
      });
    };
  
    vm.removeUsuario = function(usuario) {
      if (!confirm('Tem certeza que deseja remover este usuário?')) {
        return;
      }
      var promise = dao.remove(db.usuarios, {_id: usuario._id}, false);
      promise.then(function(count) {
        vm.usuario = null;
        vm.findUsuarios();
        alert.success("Usuário removido.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar remover o usuário. (" + err + ")");
      });
    };
  
    vm.validatePassword = function(password) {
      if (!password.original) {
        password.error = {'required': true};
      } else if (password.original != password.confirmation) {
        password.error = {'password': true};
      } else {
        password.error = null;
      }
    };
  
  });