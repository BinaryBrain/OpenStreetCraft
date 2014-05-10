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

json_file = './OSMData.json'
data = JSON.parse(File.open(json_file).read)
highways = find_highway data
p highways
