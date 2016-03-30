src/main.c.o: %.o: %
	@mkdir -p ${dir build/obj/release/$@}
	@gcc -Wall -O3 -Wextra -c $< -o build/obj/release/$@

release: src/main.c.o
	@mkdir -p build/bin
	@gcc build/obj/release/src/main.c.o -o build/bin/wilu

clean-release: 
	@rm -rf build

grr.h headers/faa.h headers/more/daf.h headers/more/ffd.h headers/rew.h tee.h:
	@mkdir -p ${dir build/include/$@}
	@cd src; cp --parents -t ../build/include $@

include: grr.h headers/faa.h headers/more/daf.h headers/more/ffd.h headers/rew.h tee.h

clean-include: 
	@rm -rf build

clean: clean-release clean-include