require './utils.rb'

def process_highway(list_nodes)
  list_nodes.map do |nodes|
    nodes.each_cons(2).map do |(node1, node2)|
      x0, y0 = node1
      x1, y1 = node2
      l1 = line(x0 - 2, y0 - 2, x1 - 2, y1 - 2)
      l2 = line(x0 - 1, y0 - 1, x1 - 1, y1 - 1)
      l3 = line(x0, y0, x1, y1)
      l4 = line(x0 + 1, y0 + 1, x1 + 1, y1 + 1)

      [l1, l2, l3, l4].flatten
    end
  end
end
