To start, please put folder to a webserver, example: IIS, Apache ...

##1.How to open new JSON file:
    - To open a JSON file, you can drag/drop file, choose by click left textbox. It support JSON and TXT file
      If it is not right format JSON file, an mess will be show error

##2.How to create JSON file:
    - Use UI to create
      You must enter key, if it empty an alert will be show
      If key have already exits, an confirm dialog will be show to ask you want replace old key?
      A key have 5 formats: text, number, Boolean, object, array

##3.How to edit JSON file:
    - How to edit JSON file
      When you delete a key, an alert will be show to confirm delete

##4.How to save JSON file:
    - To save JSON file, click Save button, you can choose format of file will save: txt, JSON.
      File name must is a file name valid, if it not valid, an mess will be show to alert this.

##5.Example JSON file:
<img src="http://i.imgur.com/OFl6cLK.png" />
    {
      "key 1": "value 1",
      "key 2": 2,
      "key 3": true,
      "key 4": {
        "key 4.1": "value 4.1",
        "key 4.2": {
          "key 4.2.1": "value 4.2.1"
        }
      },
      "key 5": [
        "value 5.1"
      ],
      "__comment": {
        "key 1": "comment 1",
        "key 2": "comment 2",
        "key 3": "comment 3",
        "key 4": {
          "key 4.1": "comment 4.1",
          "key 4.2": {
            "key 4.2.1": "comment 4.2.1"
          }
        },
        "key 5": [
          "comment 5.1"
        ]
      }
    }
