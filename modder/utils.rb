def line(x0, y0, x1, y1)
  range = x0 < x1 ? (x0.to_i..x1.to_i) : (x1.to_i..x0.to_i)
  range.map do |n|
    sl = slope(x0, y0, x1, y1)
    dy = x0 * sl + y0
    [n, dy.to_i + (sl * n).to_i] rescue [0, 0]
  end
end

def slope(x0, y0, x1, y1)
  (y1 - y0).abs / (x1 - x0).abs
end
