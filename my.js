var model = { 	
	"groups":[
			{
				"name":"ul",
				"vid": "ul.svg",
				"color":"#e57373"
			},
			{
				"name":"gma",
				"vid": "ul.svg",
				"color":"#4DB6AC"
			}

	],
	"entities":[
		{ 
			"name":"ul_vol",
			"group":"ul",
			"attributes": [
				{"name":"volid", "description":"Volume ID", "type":"VARCHAR2(200)"},
				{"name":"fileid", "description": "File ID", "type":"NUMBER(12)"}
			]
		},
		{
			"name":"ul_file",
			"group":"ul",
			"attributes": [
				{"name":"fileid", "description": "File ID"},
				{"name":"description", "description":"Description of the file"},
				{"name":"fileid2", "description": "File ID"},	
				{"name":"fileid3", "description": "File ID"},	
				{"name":"fileid4", "description": "File ID"},	
				{"name":"fileid5", "description": "File ID"},
				{"name":"fileid6", "description": "File ID"},	
				{"name":"fileid7", "description": "File ID"},	
				{"name":"fileid8", "description": "File ID"},	
				{"name":"fileid9", "description": "File ID"},
			]
		},
		{
			"name":"ul_sec",
			"group":"ul",
			"attributes": [
				{"name":"secid", "description":"Section ID"},
				{"name":"description", "description":"Description of the Section"}
			]
		},
		{
			"name":"gma_system_and_special",
			"group":"gma",
			"attributes": [
				{"name":"secid", "description":"Section ID"},
				{"name":"description", "description":"Description of the Section"}
			]
		},
		{
			"name":"gma_marking",
			"group":"gma",
			"attributes": [
				{"name":"secid", "description":"Section ID"},
				{"name":"description", "description":"Description of the Section"}
			]
		},
		{
			"name":"gma_marking_value",
			"group":"gma",
			"attributes": [
				{"name":"secid", "description":"Section ID"},
				{"name":"description", "description":"Description of the Section"}
			]
		}

	],
	"references": [
				{
					"source":"ul_vol",
					"target":"ul_file",
				},
				{
					"source":"ul_sec",
					"target":"ul_vol",
				},
				{
					"source":"ul_sec",
					"target":"gma_system_and_special",
				},
				{
					"source":"ul_vol",
					"target":"gma_system_and_special",
				},
				{
					"source":"gma_marking",
					"target":"gma_system_and_special",
				},
				{
					"source":"gma_marking_value",
					"target":"gma_system_and_special",
				}		
	]

}
