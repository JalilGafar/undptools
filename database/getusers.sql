	SELECT id, name, username, email, tel
    FROM undptools.roles
    JOIN (SELECT id, roleId, userId, username, email, tel
		FROM undptools.user_roles
		INNER JOIN undptools.users ON user_roles.userId = users.id) JU ON JU.roleId = roles.idrole ;