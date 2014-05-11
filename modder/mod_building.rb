require './utils.rb'

def process_building(list_nodes)
  list_nodes.map do |nodes|
    closing_segment = [nodes.first, nodes.last]
    nodes.each_cons(2).to_a.push(closing_segment).map do |(node1, node2)|
      x0, y0 = node1
      x1, y1 = node2
      height = node1.last
      [line(x0, y0, x1, y1), height].flatten
    end
  end
end

def draw_building(elevations, list_cubes)
  cubes_coordinates = list_cubes.map do |cubes|
    cubes.map do |c|
      x, y, height = c
      x = 0
      elev = elevations[x][y]
      column = (elev..elev + height).map do |n|
        [x, y, n]
      end
      column.flatten(1)
    end
  end

  cubes_coordinates.flatten();
end

def get_node_building(data, way, node_ref)
  height = way['tags']['height'] || Random.rand(3..20)
  node = data['node'][node_ref.to_s]
  [node['lat'].to_f, node['lon'].to_f, height.to_f]
end
