'use strict';

const categories = require.main.require('./src/categories');
const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');

const CategoryQueuePlugin = {
	settings: {},
};

CategoryQueuePlugin.init = async function (data) {
	async function renderAdminPage(req, res) {
		const cids = await db.getSortedSetRange('categories:cid', 0, -1);
		const categoriesData = await categories.getCategoriesData(cids);
		const categoriesTree = categories.getTree(categoriesData);

		res.render('admin/plugins/category-queue', { categories: categoriesTree || [] });
	}

	data.router.get('/admin/plugins/category-queue', data.middleware.admin.buildHeader, renderAdminPage);
	data.router.get('/api/admin/plugins/category-queue', renderAdminPage);

	CategoryQueuePlugin.settings = await meta.settings.get('category-queue');

	return Promise.resolve();
};

CategoryQueuePlugin.addAdminNavigation = async function (header) {
	header.plugins.push({
		route: '/plugins/category-queue',
		icon: 'fa-tint',
		name: 'Category Queue',
	});
	return header;
};

CategoryQueuePlugin.postQueue = async function (postData) {
	const targetCid = Number(postData.data.cid);
	const cids = Object.values(CategoryQueuePlugin.settings).map(Number).filter(Boolean);
	if (targetCid && cids.includes(targetCid)) {
		postData.shouldQueue = true;
	}
	return postData;
};

module.exports = CategoryQueuePlugin;
