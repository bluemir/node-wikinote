module.exports = LayoutManager;

function LayoutManager(wikipath){
	this.breadcrumbs = true;
	this.special = false;
}
LayoutManager.prototype.disableBreadcrumb = function(){
	this.breadcrumbs = false;
}
LayoutManager.prototype.isGlobal = function(){
	return this.menu.global;
}
LayoutManager.prototype.setSpecialPage = function(){
	this.special = true;
	this.breadcrumbs = false;
}
LayoutManager.prototype.isSpecial = function(){
	return this.special;
}
