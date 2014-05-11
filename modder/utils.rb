def line(x0, y0, x1, y1)
  range = x0 < x1 ? (x0.to_i..x1.to_i) : (x1.to_i..x0.to_i)
  range.map do |n|
    sl = slope(x0, y0, x1, y1)
    dy = x0 * sl + y0
    y_final_yada = dy.to_i + (sl * n).to_i
    if y_final_yada.zero? or n.zero? or dy.zero? or sl.zero?
      require 'pry'; binding.pry
    end
    [n, y_final_yada] rescue [0, 0]
  end
end

def slope(x0, y0, x1, y1)
  sl = (y1 - y0).abs / (x1 - x0).abs

  if sl.zero?
    require 'pry'; binding.pry
    sl
  else
    sl
  end

end

# def line(x0, y0, x1, y1)
#   dx     = (x1 - x0).abs
#   dy     = -(y1 - y0).abs
#   step_x = x0 < x1 ? 1 : -1
#   step_y = y0 < y1 ? 1 : -1
#   err    = dx + dy

#   coords = Set.new [[x0, y0]]
#   begin
#     e2 = 2*err;
#     if e2 >= dy
#       err += dy
#       x0 += step_x
#     end
#     if e2 <= dx
#       err += dx
#       y0 += step_y
#     end
#     coords << [x0, y0]
#   end until (x0 == x1 && y0 == y1)
#   coords.to_a
# end
