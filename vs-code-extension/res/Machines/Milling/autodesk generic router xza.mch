{
  "controller": {
    "default": {
      "head_info_part_id": "head",
      "max_block_processing_speed": 0,
      "max_normal_speed": 0,
      "parts": {
        "X": {
          "coordinate": 0,
          "max_normal_speed": 0,
          "max_rapid_speed": 0,
          "preference": "negative",
          "reset": "never",
          "reversed": false,
          "tcp": false,
          "zero_position_offset": 0
        },
        "Y": {
          "coordinate": 1,
          "max_normal_speed": 0,
          "max_rapid_speed": 0,
          "preference": "negative",
          "reset": "never",
          "reversed": false,
          "tcp": false,
          "zero_position_offset": 0
        },
        "Z": {
          "coordinate": 2,
          "max_normal_speed": 0,
          "max_rapid_speed": 0,
          "preference": "negative",
          "reset": "never",
          "reversed": false,
          "tcp": false,
          "zero_position_offset": 0
        },
        "rotary_0": {
          "coordinate": 0,
          "max_normal_speed": 21600,
          "max_rapid_speed": 0,
          "preference": "no preference",
          "reset": "never",
          "reversed": false,
          "tcp": false,
          "zero_position_offset": 0
        }
      },
      "table_part_id": "table"
    }
  },
  "fusion": {
    "default": {
      "guid": "f4b549f6-4dfb-3724-9b2e-0f8bb742f15e"
    }
  },
  "general": {
    "capabilities": [
      "milling"
    ],
    "description": "This machine has A axis on the Table and XZ axis on the Head",
    "minimumRevision": 45805,
    "model": "Generic 3-axis Router (A Table)",
    "vendor": "Autodesk"
  },
  "interactions": {
    "default": {
      "pairs": [
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "head",
              "type": "tool"
            },
            {
              "id": "X",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "head",
              "type": "tool"
            },
            {
              "id": "Y",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "head",
              "type": "tool"
            },
            {
              "id": "rotary_0",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "head",
              "type": "tool"
            },
            {
              "id": "Z",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "head",
              "type": "tool"
            },
            {
              "id": "table",
              "type": "stock"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "head",
              "type": "tool"
            },
            {
              "id": "table",
              "type": "fixture"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "X",
              "type": "machine_part"
            },
            {
              "id": "Y",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "X",
              "type": "machine_part"
            },
            {
              "id": "rotary_0",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "X",
              "type": "machine_part"
            },
            {
              "id": "Z",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "X",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "stock"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "X",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "fixture"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "Y",
              "type": "machine_part"
            },
            {
              "id": "rotary_0",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "Y",
              "type": "machine_part"
            },
            {
              "id": "Z",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "Y",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "stock"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "Y",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "fixture"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "rotary_0",
              "type": "machine_part"
            },
            {
              "id": "Z",
              "type": "machine_part"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "rotary_0",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "stock"
            }
          ]
        },
        {
          "setting": [
            "check_collisions"
          ],
          "solids": [
            {
              "id": "rotary_0",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "fixture"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "Z",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "stock"
            }
          ]
        },
        {
          "setting": null,
          "solids": [
            {
              "id": "Z",
              "type": "machine_part"
            },
            {
              "id": "table",
              "type": "fixture"
            }
          ]
        }
      ]
    }
  },
  "kinematics": {
    "default": {
      "conventions": {
        "rotation": "right-handed"
      },
      "parts": [
        {
          "control": "driven",
          "direction": [
            -1,
            0,
            0
          ],
          "id": "X",
          "name": "X",
          "parts": [
            {
              "control": "driven",
              "direction": [
                0,
                -1,
                0
              ],
              "id": "Y",
              "max": 0,
              "min": 0,
              "name": "Y",
              "parts": [
                {
                  "axis_of_rotation": {
                    "direction": [
                      -1,
                      0,
                      0
                    ],
                    "point": [
                      0,
                      0,
                      0
                    ]
                  },
                  "control": "driven",
                  "id": "rotary_0",
                  "name": "A",
                  "parts": [
                    {
                      "attach_frame": {
                        "point": [
                          0,
                          0,
                          0
                        ],
                        "x_direction": [
                          1,
                          0,
                          0
                        ],
                        "z_direction": [
                          0,
                          0,
                          1
                        ]
                      },
                      "display_name": "table",
                      "id": "table",
                      "type": "table"
                    }
                  ],
                  "type": "rotary"
                }
              ],
              "type": "linear"
            }
          ],
          "type": "linear"
        },
        {
          "control": "driven",
          "direction": [
            0,
            0,
            1
          ],
          "id": "Z",
          "name": "Z",
          "parts": [
            {
              "attach_frame": {
                "point": [
                  0,
                  0,
                  0
                ],
                "x_direction": [
                  1,
                  0,
                  0
                ],
                "z_direction": [
                  0,
                  0,
                  1
                ]
              },
              "display_name": "head",
              "id": "head",
              "spindle": {
                "max_speed": 0,
                "min_speed": 0
              },
              "tool_station": {
                "coolants": [
                  "flood"
                ],
                "max_tool_diameter": 0,
                "max_tool_length": 0
              },
              "type": "head"
            }
          ],
          "type": "linear"
        }
      ],
      "units": {
        "angle": "degrees",
        "length": "mm"
      }
    }
  },
  "machining": {
    "default": {
      "feedrate_ratio": 1,
      "tool_change_time": 15
    }
  },
  "multiaxis": {
    "default": {
      "feedrate": {
        "BPW_ratio": 1,
        "max_feedrate": 9999.99,
        "method": "FPM",
        "output_tolerance": 0.5,
        "type": "combination"
      },
      "retract_and_reconfigure": {
        "enabled": false,
        "safe_plunge_feedrate": 250,
        "safe_retract_distance": 25,
        "safe_retract_feedrate": 500,
        "stock_expansion": [
          2.5,
          2.5,
          2.5
        ]
      },
      "singularity": {
        "adjust": true,
        "angle": 0.17453292519943295,
        "cone": 0.05235987755982989,
        "method": "rotary",
        "tolerance": 0.04
      },
      "virtual_tool_tip": false
    }
  },
  "post": {
    "default": {
      "path": "system://"
    }
  },
  "tooling": {
    "default": {
      "has_tool_changer": false,
      "number_of_tools": 100,
      "supports_tool_preload": false
    }
  }
}