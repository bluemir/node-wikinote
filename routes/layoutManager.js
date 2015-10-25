module.exports = LayoutManager;

function LayoutManager(wikipath){
	this.menu = {
		local : true,
		global : true
	};
	this.breadcrumbs = true;
}

LayoutManager.prototype.disableLocalMenu = function(){
	this.menu.local = false;
}
LayoutManager.prototype.disableGlobalMenu = function(){
	this.menu.global = false;
}
LayoutManager.prototype.disableBreadcrumb = function(){
	this.breadcrumbs = false;
}
