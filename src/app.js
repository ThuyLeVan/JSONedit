'use strict';

var app = angular.module('myApp', ['angularFileUpload', 'ngRoute','JSONedit']);

// Router config menu
app.config(function ($routeProvider) {
    $routeProvider
		.when("/", {
		    templateUrl: "views/home.html",
		    controller: "MainViewCtrl"
		})
		.when("/example", {
		    templateUrl: "views/example.html"
		})
    .when("/about", {
        templateUrl: "views/about.html"
    })
    .otherwise({
        redirectTo: "/"
    })
});

// Config save file by Blob
app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/)
}]);

// HeaderCtrl controller
app.controller('HeaderCtrl', function ($scope, $location) {
    $scope.appTitle = "JSON Editor";

    // Active item when click menuitem
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path()
    }
});

// MainViewCtrl controller
app.controller('MainViewCtrl', ["$scope", "$routeParams", "$filter", "$window", function ($scope, $routeParams, $filter, $window) {

    $scope.showMess = false;
    $scope.jsonData = {};
    $scope.jsonComment = {};

    // Check valid JSON file
    $scope.isValidJSON = function (json) {
        try {
            JSON.parse(json);
            return true;
        } catch (e) {
            return false;
        }
    };

    // Load upload file
    $scope.$watch('uploadedFile', function () {
        if ($scope.uploadedFile != null) {
            var file = $scope.uploadedFile[0];
            var reader = new FileReader();

            reader.onload = function (event) {
                var uploadedFile = this.result;

                if ($scope.isValidJSON(uploadedFile) == true) {
                    $scope.showMess = false;

                    // set data jsonComment
                    if(JSON.parse(uploadedFile).hasOwnProperty('__comment')){
                      $scope.jsonComment =JSON.parse(uploadedFile)["__comment"];
                    } else{
                      $scope.jsonComment = JSON.parse(uploadedFile);
                    }

                    // set data jsonData
                    $scope.jsonData = {};
                    $scope.jsonData = JSON.parse(uploadedFile);

                    // Set data treeview
                    $('#element').empty();
                    $('#element').jsonView(JSON.stringify($scope.jsonData));
                } else {
                    $scope.showMess = true;

                    // Empty data jsonData, treeview
                    $scope.jsonData = {};
                    $scope.jsonComment = {};
                    $('#element').empty();
                }
            }
            reader.readAsText(file);
        }
    }, true);

    // Watch when jsonData change
    $scope.$watch('jsonData', function (json) {
        json["__comment"] = $scope.jsonComment;
        $("#element").empty();
        $('#element').jsonView(JSON.stringify(JSON.parse($filter('json')(json))));
    }, true);

    // Watch when jsonComment change
    $scope.$watch('jsonComment', function(json){
      $scope.jsonData["__comment"] = json;
    },true);

    // CheckName of file\
    // A filename cannot contain any of the following characters:\ / : * ? " < > | (Window)
    $scope.checkName = function () {

        var name = $scope.fileName;
        var notIsvalid = /:|\||<|>|"|\?|\*|\\|\//g;
        $scope.showErrName = false;
        $scope.validFileName = true;

        if (name.length != 0) {
            if (name.match(notIsvalid)) {
                $scope.showErrName = true;
            } else {
                $scope.validFileName = false;
            }
        } else {
            $scope.validFileName = true;
        }
    };
    // Save file use Blob
    $scope.savefile = function () {

        var format = $scope.fileFormat,
            name = $scope.fileName,
            data = $filter('json')($scope.jsonData);
        var url = $window.URL || $window.webkitURL;

        if (format == "txt") {
            var blob = new Blob([data], { type: 'text/plain' });
        } else {
            var blob = new Blob([data], { type: 'application/json' });
        }

        $scope.fileNameSave = name + "." + format;
        $scope.fileUrlSave = url.createObjectURL(blob);
        $('#myModal').modal('toggle');
    };
}]);
