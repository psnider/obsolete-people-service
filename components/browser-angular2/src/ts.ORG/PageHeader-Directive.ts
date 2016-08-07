export function directive() {
    return {
        restrict: 'E',
        templateUrl: '/html/PageHeader.directive.html',
        link: function (scope, element, attrs) {
            var hdr  = element.find('h1')[0];
            hdr.textContent = attrs.title;
        }
    }
}
