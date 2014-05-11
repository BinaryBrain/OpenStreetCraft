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
  lat, lon = node['lat'].to_f, node['lon'].to_f
  OpenStruct.new({ lat: lat, lon: lon })
end

def cubes_to_trace(list_nodes)
  list_nodes.map do |nodes|
    nodes.each_cons(2).map do |(node1, node2)|
      cubes_on_segment(node1, node2)
    end
  end
end

def slope(node1, node2)
  (node2.lat - node1.lat).abs / (node2.lon - node1.lon).abs
end

def cubes_on_segment(node1, node2)
  lon1, lon2 = node1.lon.to_i, node2.lon.to_i
  range = lon1 < lon2 ? (lon1..lon2) : (lon2..lon1)
  range.map do |n|
    lat, lon = [(slope(node1, node2) * n).to_i, n] rescue [nil, nil]
    OpenStruct.new({ lat: lat, lon: lon })
  end
end

def create_mod(data, cubes, data_value)
  elevation = data['elevation']
  cubes_coordinates = cubes.map do |c|
    x, y = c.first, c.last
    [x, y, elevation[x][y]]
  end
  data['mods'].push({ t: data_value, c: cubes_coordinates })
end

elevation_file = '../data/map.json'
elevation_data = JSON.parse(File.open(elevation_file).read)
osm_data_file = './OSMData.json'
osm_data = JSON.parse(File.open(osm_data_file).read)
road_data_file = './map_with_road.json'
road_types_file = '../data/types/roads.json'
road_types = JSON.parse(road_types_file)

data = types.map do |(key, values)|
  values.map do |(type, data_value)|
    highways = find_ways(osm_data, key, type)
    list_nodes = find_node_refs(osm_data, highways)
    cubes = cubes_to_trace(list_nodes).map do |list_cubes|
      list_cubes.flatten.map do |c|
        [c.lat, c.lon]
      end
    end

    create_mod(elevation_data, cubes, data_value)
  end
end

File.write(map_file, data)
