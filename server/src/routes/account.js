import express from 'express';
import Account from '../models/account';

const router = express.Router();

/*
  Account SIGNUP : POST /api/account/signup
*/

router.post('/signup', async (req, res) => {
	//CHECK USERNAME FORMAT
	let re = /^[A-Za-z0-9]{4,15}$/;
	if (!re.test(req.body.username)) {
		return res.status(400).json({
			property: 'username',
			error: '올바르지 못한 아이디 형식 : 알파벳 + 숫자, 4글자 이상 15글자 이하'
		});
	}

	//CHECK PASSWORD FORMAT
	if (
		typeof req.body.password !== 'string' ||
		req.body.password.length < 4 ||
		req.body.password.length > 15
	) {
		return res.status(400).json({
			property: 'password',
			error: '올바르지 못한 비밀번호 형식 : 4글자 이상 15글자 이하'
		});
	}

	//CHECK TYPE FORMAT
	if (typeof req.body.type !== 'boolean') {
		return res.status(400).json({
			property: 'type',
			error: '올바르지 못한 관리자/직원 구분'
		});
	}

	//CHECK USERNAME EXIST
	let account = null;
	try {
		account = await Account.findOne({ username: req.body.username });
	} catch (error) {
		throw error;
	}

	if (account) {
		return res.status(409).json({
			property: 'username',
			error: '이미 존재하는 아이디'
		});
	}
	//IF MANAGER
	if (req.body.type) {
		//CREATE ACCOUNT
		const newAccount = new Account({
			username: req.body.username,
			password: req.body.password,
			type: req.body.type
		});

		newAccount.password = newAccount.generateHash(newAccount.password);

		//SAVE IN THE DATABASE
		newAccount.save(err => {
			if (err) throw err;
			return res.json({ success: true });
		});
	}

	//IF NOT MANAGER ID
	if (typeof req.body.employee_info === 'undefined') {
		return res.status(400).json({
			property: 'employee_info',
			error: '올바르지 못한 요청'
		});
	}

	//CHECK employee_info.IS_FREE FORMAT
	if (typeof req.body.employee_info.is_free !== 'boolean') {
		return res.status(400).json({
			property: 'employee_info.is_free',
			error: '올바르지 못한 요청'
		});
	}

	//iF NOT FREE ATTENDANCE
	if (!req.body.employee_info.is_free) {
		//CHECK employee_info.IN FORMAT
		if (typeof req.body.employee_info.in !== 'string') {
			return res.status(400).json({
				property: 'employee_info.in',
				error: '올바르지 못한 요청'
			});
		}

		const timeRegex = /^([01][0-9]|2[1-3]):[0-5][0-9]:00$/;
		if (!timeRegex.test(req.body.employee_info.in)) {
			return res.status(400).json({
				property: 'employee_info.in',
				error: '올바르지 못한 출근시간'
			});
		}

		//CHECK employee_info.OUT FORMAT
		if (typeof req.body.employee_info.out !== 'string') {
			return res.status(400).json({
				property: 'employee_info.out',
				error: '올바르지 못한 요청'
			});
		}

		if (!timeRegex.test(req.body.employee_info.out)) {
			return res.status(400).json({
				property: 'employee_info.out',
				error: '올바르지 못한 퇴근시간'
			});
		}
	} else {
		//CHECK HOUR FORMAT
		if (
			typeof req.body.employee_info.hours !== 'number' ||
			req.body.employee_info.hours < 0.5 ||
			req.body.employee_info.hours > 20
		) {
			return res.status(400).json({
				property: 'employee_info.hours',
				error: '올바르지 못한 근무시간 : 30분 이상 20시간 이하'
			});
		}
	}

	//CHECK IP FORMAT
	const ipRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

	if (
		typeof req.body.employee_info.ip !== 'string' ||
		!ipRegex.test(req.body.employee_info.ip)
	) {
		return res.status(400).json({
			property: 'employee_info.ip',
			error: '올바르지 못한 아이피'
		});
	}

	//CHECK MANAGER FORMAT
	if (typeof req.body.employee_info.manager !== 'string') {
		return res.status(400).json({
			property: 'employee_info.manager',
			error: '올바르지 못한 요청'
		});
	}

	//CHECK MANAGER EXIST
	let manager = null;
	try {
		manager = await Account.findOne({
			username: req.body.employee_info.manager
		});
	} catch (error) {
		throw error;
	}

	if (!manager || !manager.type) {
		return res.status(409).json({
			property: 'employee_info.manager',
			error: '존재하지 않은 관리자 아이디'
		});
	}

	//CREATE ACCOUNT
	const newAccount = new Account({
		username: req.body.username,
		password: req.body.password,
		type: req.body.type,
		employee_info: {
			is_free: req.body.employee_info.is_free,
			in: req.body.employee_info.in,
			out: req.body.employee_info.out,
			hours: req.body.employee_info.hours,
			manager: req.body.employee_info.manager,
			ip: req.body.employee_info.ip
		}
	});

	newAccount.password = newAccount.generateHash(newAccount.password);

	//SAVE IN THE DATABASE
	newAccount.save(err => {
		if (err) throw err;
		return res.json({ success: true });
	});
});

export default router;
