const jwt = require('jsonwebtoken');
const { authenticateUser, getUserRole } = require('../../Repository/MySqlRepo');

async function authenticateUserService(mapObject) {
	try {
		const authentication = await authenticateUser(
			mapObject.username,
			mapObject.password
		);
		if (authentication.err) {
			return {
				success: false,
			};
		}
		return { success: true, token: authentication.token };
	} catch (e) {
		console.error(e);
	}
}

async function authenticateTokenService(req, res, next) {
	const token = req.query.token;
	if (!token) {
		return res.redirect('/?error=TokenNotProvided');
	}

	try {
		const { username } = jwt.verify(token, '92BC8A7FBBD5475D75C11CC1EA98E');
		const { err, role } = await getUserRole(username);
		if (role !== 'whadmin' && role !== 'staff') {
			return res.redirect('/?error=NoPermissionToAccess');
		}
		req.userRole = role;
		next();
	} catch (e) {
		return res.redirect('/?error=TokenExpired');
	}
}

module.exports = {
	authenticateUserService: authenticateUserService,
	authenticateTokenService: authenticateTokenService,
};
