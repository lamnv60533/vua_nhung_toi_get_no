class User {
  int? userId;
  String? username;
  String? email;
  String? phone;
  String? type;
  String? accessToken;
  Object? realmAccess;
  Object? resourceAccess;
  List<String>? roles;

  User(
      {this.userId,
      this.username,
      this.email,
      this.phone,
      this.type,
      this.accessToken,
      this.realmAccess,
      this.resourceAccess,
      this.roles});

  factory User.fromJson(Map<String, dynamic> responseData) {
    return User(
        userId: responseData['id'],
        username: responseData['username'],
        email: responseData['email'],
        accessToken: responseData['access_token'],
        realmAccess: responseData['realm_access'],
        resourceAccess: responseData['realm_access'],
        roles: responseData["roles"]);
  }
}
