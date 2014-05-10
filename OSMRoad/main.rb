#!/usr/bin/env ruby

require 'json'

def highways(data, tag = nil)
  if tag
    data['way'].select do |elem|
      elem['tags']['highway'] == tag.to_s
    end
  else
    data['way'].select do |elem|
      elem['tags'].keys.include? 'highway'
    end
  end
end

def node_refs(data, ways)
  ways.map do |w|
    w['nodeRefs'].map do |nr|
      node(data, nr)
    end
  end
end

def node(data, node_ref)
  node = data['node'][node_ref.to_s]
  lat, lon = node['lat'], node['lon']
  OpenStruct.new({lat: lat, lon: lon})
end

def trace_way(list_nodes)
  list_nodes.map do |nodes|
    nodes.each_cons(2).map do |(node1, node2)|
      concerned_cubes(node1, node2)
    end
  end
end

def slope(node1, node2)
  node2.lat - node1.lat / node2.lon - node1.lon
end

def concerned_cubes(node1, node2)
  Range.new(node1.lon, node2.lon).map do |n|
    slope(node1, node2) * n
  end
end



json_file = './OSMData.json'
data = JSON.parse(File.open(json_file).read)
highways = find_highway data
p highways
