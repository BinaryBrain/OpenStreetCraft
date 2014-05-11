#!/usr/bin/env ruby

require 'json'

def find_ways(data, key, tag = nil)
  if tag
    data['way'].select do |elem|
      elem['tags'][key] == tag.to_s
    end
  else
    data['way'].select do |elem|
      elem['tags'].keys.include? key
    end
  end
end

def find_node_refs(data, ways)
  ways.map do |w|
    w['nodeRefs'].map do |nr|
      node(data, nr)
    end
  end
end

def node(data, node_ref)
  node = data['node'][node_ref.to_s]
  [node['lat'].to_f, node['lon'].to_f]
end

# must return
def cubes_to_trace(key, list_nodes)
  if require "./mod_#{key}"
    send("process_#{key}", list_nodes)
  end
end

def create_mod(data, list_cubes, data_value)
  elevation = data['elevation']
  unless elevation.empty?
    cubes_coordinates = list_cubes.map do |cubes|
      cubes.map do |c|
        (x, y) = c
        [x, y, elevation[x][y]]
      end
    end
    { t: data_value, c: cubes_coordinates }
  end
end

def process_main(map_data, osm_data, types)
  mods = types.map do |(key, values)|
    values.map do |(type, data_value)|
      highways = find_ways(osm_data, key, type)
      unless highways.empty?
        list_nodes = find_node_refs(osm_data, highways)
        cubes = cubes_to_trace(key, list_nodes).map do |list_cubes|
          list_cubes.flatten
        end

        create_mod(map_data, cubes, data_value)
      end
    end
  end

  map_data['mods'] = mods.compact
  map_data
end

map_file = '../data/map.json'
map_data = JSON.parse(File.open(map_file).read)
osm_data_file = '../data/OSMData.json'
osm_data = JSON.parse(File.open(osm_data_file).read)
types_file = '../data/types.json'
types = JSON.parse(File.open(types_file).read)

data = process_main(map_data, osm_data, types)
File.write(map_file, data)
