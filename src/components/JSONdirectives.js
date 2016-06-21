'use strict';
var app = angular.module('JSONedit', []);

// Override the default input to update on blur
app.directive('ngModelOnblur', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;
            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(elm.val())
                })
            })
        }
    }
});

// Declare directive jsonedit
app.directive('json', ["$compile", function($compile) {
    return {
        restrict: 'E',
        scope: {
            child: '=', // Two-way binding
            comment: '=',
            type: '@', // One-way binding
            defaultCollapsed: '='
        },
        link: function (scope, element, attributes) {
            // Declare types of item: text,number,Boolean,Object và Array
            var stringName = "Text";
            var objectName = "Object";
            var arrayName = "Array";
            var boolName = "Boolean";
            var numberName = "Number";
            scope.valueTypes = [stringName, objectName, arrayName, boolName, numberName];

            // Check variable defaultCollapsed, default false
            if (scope.$parent.defaultCollapsed === undefined) {
                scope.collapsed = false;
            } else {
                scope.collapsed = scope.defaultCollapsed;
            };

            // Check variable collapsed
            if (scope.collapsed) {
                scope.chevron = "glyphicon-chevron-right";
            } else {
                scope.chevron = "glyphicon-chevron-down";
            };

            // Function getType return type of obj input
            var getType = function (obj) {
                var type = Object.prototype.toString.call(obj)

                if (type === "[object Object]") {
                    return "Object";
                } else if (type === "[object Array]") {
                    return "Array";
                } else if (type === "[object Boolean]") {
                    return "Boolean";
                } else if (type === "[object Number]") {
                    return "Number";
                } else {
                    return "Text";
                }
            };
            scope.getType = function (obj) {
                return getType(obj)
            };

            // Function possibleNumber
            var isNumber = function (n) {
                return !isNaN(parseFloat(n)) && isFinite(n)
            };
            scope.possibleNumber = function (val) {
                return isNumber(val) ? parseFloat(val) : val;
            };

            // Function toggleCollapse call event when click icon Collapse
            scope.toggleCollapse = function () {
                if (scope.collapsed) {
                    scope.collapsed = false;
                    scope.chevron = "glyphicon-chevron-down";
                } else {
                    scope.collapsed = true;
                    scope.chevron = "glyphicon-chevron-right";
                }
            };

            // Function moveKey replace an obj[key] by obj[newkey]
            scope.moveKey = function (obj, key, newkey) {
                if (key !== newkey) {
                    obj[newkey] = obj[key];
                    delete obj[key];
                    // moveKey comment
                    scope.comment[newkey] = scope.comment[key];
                    delete scope.comment[key];
                }
            };

            //Function deleteItem
            scope.deleteKey = function (obj, key) {
                if (getType(obj) == "Object") {
                    if (confirm('Delete "' + key + '" and all it contains?')) {
                        delete obj[key];
                        // Delete comment
                        delete scope.comment[key];
                    }
                } else if (getType(obj) == "Array") {
                    if (confirm('Delete it?')) {
                        obj.splice(key, 1);
                        // Delete comment
                        scope.comment.splice(key, 1);
                    }
                } else {
                    console.error("object to delete from was " + obj)
                }
            };

            //Function addItem
            scope.addItem = function (obj) {
                if (getType(obj) == "Object") {
                    // Check keyName
                    if (scope.keyName == undefined || scope.keyName.length == 0) {
                        alert("Please fill in a name !");
                    }
                    else if (scope.keyName.indexOf("$") == 0) {
                        alert("The name may not start with '$' !");
                    }
                    else if (scope.keyName.indexOf("_") == 0) {
                        alert("The name may not start with '_' !");
                    }
                    else {
                        // Check exist keyName
                        if (obj[scope.keyName]) {
                            // Confirm replace exist keyName
                            if (!confirm('An item with the name "' + scope.keyName + '" exists already. Do you really want to replace it?')) {
                                return;
                            }
                        }
                        // Check valid when input number
                        if (scope.valueType == numberName && !isNumber(scope.valueName)) {
                            alert("Please fill in a number");
                            return;
                        }

                        // Add item
                        switch (scope.valueType) {
                            case stringName:
                                // Add key-comment
                                scope.comment[scope.keyName] = scope.commentName ? scope.commentName : "";
                                // Add key-value
                                obj[scope.keyName] = scope.valueName ? scope.valueName : "";
                                break;

                            case numberName:
                                obj[scope.keyName] = scope.possibleNumber(scope.valueName);
                                scope.comment[scope.keyName]= scope.commentName ? scope.commentName : "";
                                break;

                            case objectName:
                                obj[scope.keyName] = {};
                                scope.comment[scope.keyName] = {};
                                break;

                            case arrayName:
                                obj[scope.keyName] = [];
                                scope.comment[scope.keyName] = [];
                                break;

                            case boolName:
                                obj[scope.keyName] = true;
                                scope.comment[scope.keyName]= scope.commentName ? scope.commentName : "";
                                break;
                        }
                        // When addItem commplete
                        scope.keyName = "";
                        scope.valueName = "";
                        scope.commentName = "";
                        scope.showAddKey = false;
                    }
                }
                else if (getType(obj) == "Array") {
                    // Check valid when input number
                    if (scope.valueType == numberName && !isNumber(scope.valueName)) {
                        alert("Please fill in a number");
                        return;
                    }
                    // Add item
                    switch (scope.valueType) {
                        case stringName:
                            // Add key-comment
                            scope.comment.push(scope.commentName ? scope.commentName : "");
                            // Add key-value
                            obj.push(scope.valueName ? scope.valueName : "");
                            break;

                        case numberName:
                            scope.comment.push(scope.commentName ? scope.commentName : "");
                            obj.push(scope.possibleNumber(scope.valueName));
                            break;

                        case objectName:
                            scope.comment.push({});
                            obj.push({});
                            break;

                        case arrayName:
                            scope.comment.push([]);
                            obj.push([]);
                            break;

                        case boolName:
                            obj.push(true);
                            scope.comment.push(scope.commentName ? scope.commentName : "");
                            break;

                    }
                    // When addItem commplete
                    scope.valueName = "";
                    scope.commentName = "";
                    scope.showAddKey = false;
                }
                else {
                    console.error("object to add to was " + obj);
                }
            };

            // Load template value of JSON item
            var switchTemplate =
                '<span ng-switch on = "getType(val)" >'
                    // Object
                    + '<json ng-switch-when="Object" child="val" comment="comment[key]" type="object" default-collapsed="defaultCollapsed"></json>'
                    // Array
                    + '<json ng-switch-when="Array" child="val" comment="comment[key]" type="array" default-collapsed="defaultCollapsed"></json>'
                    // Boolean
                    + '<span ng-switch-when="Boolean" type="boolean">'
                        + '<input type="checkbox" ng-model="val" ng-model-onblur ng-change="child[key] = val">'
                        // Add input comment
                        + '<span class="text-comment left"> // </span>'
                        + '<input type="text" ng-model="comment[key]" ng-model-onblur ng-change = "comment[key]=comment[key]" placeholder="Empty Comment ..." class="text-comment"/>'
                    + '</span>'
                    // Number
                    + '<span ng-switch-when="Number" type="number">'
                        +'<input type="text" ng-model="val" placeholder="Empty Number ..." ng-model-onblur ng-change="child[key] = possibleNumber(val)"/>'
                        + '<span class="text-comment "> // '
                        + '</span><input type="text" ng-model="comment[key]" ng-model-onblur ng-change = "comment[key]=comment[key]" placeholder="Empty Comment ..." class="text-comment"/>'
                    + '</span>'
                    // Text
                    + '<span ng-switch-default class="jsonLiteral">'
                        +'<input type="text" ng-model="val" placeholder="Empty Text ..." ng-model-onblur ng-change="child[key] = val"/>'
                        + '<span class="text-comment"> // </span>'
                        + '<input type="text" ng-model="comment[key]" ng-model-onblur ng-change = "comment[key]=comment[key]" placeholder="Empty Comment ..." class="text-comment"/>'
                    + '</span>'
                + '</span>';

            // Load template add an item
            var addItemTemplate =
                '<div ng-switch on="showAddKey" class="block">'
                    + '<span ng-switch-when="true">';
                        if (scope.type == "object") {
                            addItemTemplate += '<input placeholder="Key ..." type="text" ui-keyup="{\'enter\':\'addItem(child)\'}" '
                                + 'class="form-control input-sm addItemKeyInput" ng-model="$parent.keyName" /> ';
                        }
                        addItemTemplate +=
                            // Load valueTypes
                            '<select ng-model="$parent.valueType" ng-options="option for option in valueTypes" class="form-control input-sm"'
                            + 'ng-init="$parent.valueType=\'' + stringName + '\'" ui-keydown="{\'enter\':\'addItem(child)\'}"></select>'
                            // Load input Text value
                            + '<span ng-show="$parent.valueType == \'' + stringName + '\'"> : '
                                +'<input type="text" placeholder="Text Value ..." class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/>'
                                // Add comment of key
                                + '<input type="text" ng-model="$parent.commentName" placeholder="// Comment ..." class="form-control comment text-comment input-sm addItemValueInput" />'
                            +'</span>'
                            // Load input Number value
                            + '<span ng-show="$parent.valueType == \'' + numberName + '\'"> : '
                                +'<input type="text" placeholder="Number Value ..." class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/>'
                                + '<input type="text" ng-model="$parent.commentName" placeholder="// Comment ..." class="form-control comment text-comment input-sm addItemValueInput" />'
                            +'</span>'
                            // Load input Boolean value
                            + '<span ng-show="$parent.valueType == \'' + boolName + '\'"> : '
                                + '<input type="text" ng-model="$parent.commentName" placeholder="// Comment ..." class="form-control comment text-comment input-sm addItemValueInput" />'
                            +'</span>'
                            // Add button Add and Cancel
                            + '<span class="right">'
                                + '<button type="button" class="btn btn-success btn-sm" ng-click="addItem(child)">Add</button> '
                                + '<button type="button" class="btn btn-danger btn-sm" ng-click="$parent.showAddKey=false">Cancel</button>'
                            + '</span>'
                    + '</span>'
                    + '<span ng-switch-default>'
                        // Load button add an item (+)
                        + '<button type="button" class="addObjectItemBtn" ng-click="$parent.showAddKey = true"><i class="glyphicon glyphicon-plus addbtn"></i></button>'
                    + '</span>'
                + '</div>';

            // Main template
            if (scope.type == "object") {
                var template = '<i ng-click="toggleCollapse()" class="glyphicon" ng-class="chevron"></i>'
                + '<span class="jsonItemDesc">' + objectName + '</span>'
                // Hide div if collapsed == true
                + '<div class="jsonContents" ng-hide="collapsed">'
                    // Repeat item
                    + '<span class="block" ng-hide="key.indexOf(\'_\') == 0" ng-repeat="(key, val) in child">'
                        // Key
                        + '<span class="jsonObjectKey">'
                            + '<input class="keyinput" type="text" ng-model="newkey" ng-init="newkey=key" ng-blur="moveKey(child, key, newkey)"/>'
                            // Delete button
                            + '<i class="deleteKeyBtn glyphicon glyphicon-trash deletebtn" ng-click="deleteKey(child, key)"></i>'
                        + '</span>'
                        // Value
                        + '<span class="jsonObjectValue">' + switchTemplate + '</span>'
                    + '</span>'
                    // Repeat end

                    // Start load template add an item
                    + addItemTemplate
                + '</div>';
            }
            else if (scope.type == "array") {
                var template = '<i ng-click="toggleCollapse()" class="glyphicon" ng-class="chevron"></i>'
                + '<span class="jsonItemDesc">' + arrayName + '</span>'
                + '<div class="jsonContents" ng-hide="collapsed">'
                    + '<ol class="arrayOl" ng-model="child">'
                        // Repeat item
                        + '<li class="arrayItem" ng-repeat="(key, val) in child track by $index">'
                            // Delete button
                            + '<i class="deleteKeyBtn glyphicon glyphicon-trash deletebtn" ng-click="deleteKey(child, $index)"></i>'
                            // Value
                            + '<span>' + switchTemplate + '</span>'
                        + '</li>'
                        // Repeat end
                    + '</ol>'

                    // Start load template add an item
                    + addItemTemplate
                + '</div>';
            }
            else {
                console.error("scope.type was " + scope.type);
            }
            // compile template
            var newElement = angular.element(template);
            $compile(newElement)(scope);
            element.replaceWith(newElement);
        }
    };
}]);
