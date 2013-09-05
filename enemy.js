var generate = function() {
    long seed = r.nextLong();
    r = new Random(seed);

    long time = System.currentTimeMillis();
    clear();
    int iterations = 0;
    for (int count = 0; count < (w * h / 2) * fillPercentage; ++iterations) {
        count += grow() ? 1 : 0; // count amount of pixels set
    }
    addDecoration();

    log("Iterations: " + iterations);
    log("Random seed: " + seed);
}

var grow = function() {
    // log("Open list size: " + openList.size());
    // log("Closed list size: " + closedList.size());
    var xx, yy, p;
    Iterator it;
    do {
        it = openList.iterator();
        p = it.next();

        // Randomly pick element
        int num = r.nextInt(openList.size());
        for (int i = 0; i < num; ++i) {
            p = it.next();
        }

        xx = p.getX();
        yy = p.getY();

        if (pixels[map(xx, yy)] != PColor.EMPTY) { // Pixel is already set
            // Move to closed list
            it.remove();
            closedList.add(p);
        }
    } while (pixels[map(xx, yy)] != PColor.EMPTY);

    int countSide = 0, countDiag = 0;
    for (int ix = xx - 1; ix <= xx + 1; ++ix) {
        for (int iy = yy - 1; iy <= yy + 1; ++iy) {
            if (ix < 0 || ix >= w || iy < 0 || iy >= h / 2) // outside drawing range
                continue;
            if (pixels[map(ix, iy)] != PColor.EMPTY) {
                if (ix == xx ^ iy == yy)
                    ++countSide;
                else
                    ++countDiag;
            }
        }
    }
    // Check if we should set this pixel
    if (r.nextFloat() < evaluator.getPixelSetChance(countSide, countDiag)) {
        pixels[map(xx, yy)] = PColor.NORMAL;

        // Move point to closed list
        it.remove();
        closedList.add(p);

        // Add surrounding points to open list
        addPoint(xx + 1, yy);
        addPoint(xx - 1, yy);
        addPoint(xx, yy + 1);
        addPoint(xx, yy - 1);

        return true;
    }
    return false;
}
